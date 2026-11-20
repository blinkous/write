import { useEffect, useState } from 'react'
import { deriveCozyThemeColors } from '../../lib/cozyPalette'
import { flattenColor } from '../../lib/flattenColor'
import {
  suggestBackgroundColors,
  suggestTextColors,
  type LightnessSide,
} from '../../lib/pageColorSuggestions'
import { getSystemColorScheme, type ColorScheme } from '../../utils/colorScheme'
import {
  DEFAULT_TEXT_STYLES,
  type TextStyleName,
  type TextStyleSettings,
} from '../../text-styles'
import {
  SUGGESTED_PAGE_COLOR_COUNT,
  type Appearance,
} from './appearanceOptions'
import {
  EMPTY_PAGE_THEME_HISTORY,
  beginEdit,
  commitEdit,
  redoPageTheme,
  undoPageTheme,
  type PageTheme,
} from './pageThemeHistory'
import type { BackgroundEffects } from './themePackBackground'
import type { ThemeLook } from './themePacks'
import {
  loadPageThemeHistory,
  savePageThemeHistory,
} from './pageThemeHistoryStorage'

/* Which side of the other color suggestions start on: what suits the system's light or dark mode. */
const PREFERRED_SIDES: Record<
  ColorScheme,
  { text: LightnessSide; background: LightnessSide }
> = {
  light: { text: 'darker', background: 'lighter' },
  dark: { text: 'lighter', background: 'darker' },
}

/**
 * The fonts, page colors, text styles, tab title and background effects
 * (blur, opacity, video playback) and the sidebar border, with one shared undo/redo over recent changes (kept across refreshes).
 */
export function usePageTheme(
  {
    appFont,
    editorFont,
    backgroundColor,
    textColor,
    textStyles,
    tabTitle,
    backgroundBlur,
    backgroundOpacity,
    isBackgroundVideoPaused,
    backgroundVideoSpeed,
    hasSidebarBorder,
    backgroundFileId,
  }: Appearance,
  updateAppearance: (changes: Partial<Appearance>) => void,
) {
  const current: PageTheme = {
    appFont,
    editorFont,
    backgroundColor,
    textColor,
    textStyles,
    tabTitle,
    backgroundBlur,
    backgroundOpacity,
    isBackgroundVideoPaused,
    backgroundVideoSpeed,
    hasSidebarBorder,
    backgroundFileId,
  }
  const [history, setHistory] = useState(() => loadPageThemeHistory(current))
  const systemColorScheme = getSystemColorScheme()

  useEffect(() => savePageThemeHistory(history), [history])

  function applyStep(step: ReturnType<typeof undoPageTheme>) {
    if (!step) return
    setHistory(step.history)
    updateAppearance(step.theme)
  }

  /** Applies a change: one undo step now, or (while dragging a color or typing) when committed. */
  function change(changes: Partial<PageTheme>, isFinal: boolean) {
    setHistory((currentHistory) => {
      const started = beginEdit(currentHistory, current)
      return isFinal ? commitEdit(started, { ...current, ...changes }) : started
    })
    updateAppearance(changes)
  }

  return {
    appFont,
    editorFont,
    backgroundColor,
    textColor,
    textStyles,
    tabTitle,
    backgroundBlur,
    backgroundOpacity,
    isBackgroundVideoPaused,
    backgroundVideoSpeed,
    hasSidebarBorder,
    backgroundFileId,
    /**
     * Background files undo can bring back, the nearest steps first, so
     * they're kept while they fit (see backgroundFiles).
     */
    undoBackgroundFileIds: [
      ...(history.editStart ? [history.editStart] : []),
      ...history.past.toReversed(),
      ...history.future,
    ].flatMap((step) => (step.backgroundFileId ? [step.backgroundFileId] : [])),
    /**
     * Changes one text style. Picks are one undo step each; a color drag
     * (isFinal false) becomes one step when committed.
     */
    changeTextStyle(
      name: TextStyleName,
      changes: Partial<TextStyleSettings>,
      isFinal = true,
    ) {
      const nextStyles = {
        ...textStyles,
        [name]: { ...textStyles[name], ...changes },
      }
      change({ textStyles: nextStyles }, isFinal)
    },
    /** A font pick (app or entries) is one undo step on its own. */
    changeFonts(fonts: Partial<Pick<PageTheme, 'appFont' | 'editorFont'>>) {
      change(fonts, true)
    },
    /**
     * Only the background: the text color changes only when you change it.
     * A picker drag (isFinal false) becomes one undo step when committed; a
     * suggested or custom color is one step on its own.
     */
    changeBackground(nextBackgroundColor: string, isFinal = false) {
      change({ backgroundColor: nextBackgroundColor }, isFinal)
    },
    changeText(nextTextColor: string, isFinal = false) {
      change({ textColor: nextTextColor }, isFinal)
    },
    /** Text colors readable on the background, the system mode's side first. */
    textColorSuggestions: suggestTextColors(
      backgroundColor,
      PREFERRED_SIDES[systemColorScheme].text,
      SUGGESTED_PAGE_COLOR_COUNT,
    ),
    /** Backgrounds for how the text color looks, the system mode's side first. */
    backgroundColorSuggestions: suggestBackgroundColors(
      flattenColor(textColor, backgroundColor),
      PREFERRED_SIDES[systemColorScheme].background,
      SUGGESTED_PAGE_COLOR_COUNT,
    ),
    /** The theme's shades as #rrggbb(aa), the page text color first. */
    themeColors: deriveCozyThemeColors(backgroundColor, textColor),
    /**
     * Typing shows in the tab at once (isFinal false); the final title (e.g.
     * on leaving the field) makes the whole edit one undo step.
     */
    changeTabTitle(nextTabTitle: string, isFinal = false) {
      change({ tabTitle: nextTabTitle }, isFinal)
    },
    /** Each blur, opacity, speed or play/pause step (a press or a typed value) is one undo step. */
    changeBackgroundEffects(
      effects: Partial<
        Pick<
          PageTheme,
          | 'backgroundBlur'
          | 'backgroundOpacity'
          | 'isBackgroundVideoPaused'
          | 'backgroundVideoSpeed'
        >
      >,
    ) {
      change(effects, true)
    },
    /** A new background picture or video (already stored), or none: one undo step. */
    changeBackgroundFile(nextBackgroundFileId: string | null) {
      change({ backgroundFileId: nextBackgroundFileId }, true)
    },
    /** Showing or hiding the sidebar border is one undo step. */
    changeSidebarBorder(nextHasSidebarBorder: boolean) {
      change({ hasSidebarBorder: nextHasSidebarBorder }, true)
    },
    /** One text style back to its defaults, as one undo step. */
    resetTextStyle(name: TextStyleName) {
      change(
        { textStyles: { ...textStyles, [name]: DEFAULT_TEXT_STYLES[name] } },
        true,
      )
    },
    /** Every text style back to its default (the editor's default font stays). */
    resetTextStyles() {
      change({ textStyles: DEFAULT_TEXT_STYLES }, true)
    },
    /**
     * A theme pack's whole look (colors, fonts, text styles) and its
     * background (a file with its effects, or none), as one undo step.
     */
    applyThemeLook(
      look: ThemeLook &
        Partial<BackgroundEffects> &
        Pick<PageTheme, 'backgroundFileId'>,
    ) {
      change(look, true)
    },
    /** Ends the current edit (e.g. a finished drag) as one undo step. */
    commit() {
      setHistory((currentHistory) => commitEdit(currentHistory, current))
    },
    /** Forgets every undo and redo step, as on a first visit (e.g. after resetting settings). */
    clearHistory() {
      setHistory(EMPTY_PAGE_THEME_HISTORY)
    },
    canUndo: history.past.length > 0 || history.editStart !== null,
    canRedo: history.future.length > 0 && history.editStart === null,
    undo: () => applyStep(undoPageTheme(history, current)),
    redo: () => applyStep(redoPageTheme(history, current)),
  }
}
