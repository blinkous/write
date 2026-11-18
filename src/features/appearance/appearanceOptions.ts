import { DEFAULT_TEXT_STYLES, type TextStyles } from '../../text-styles'
import type { ColorScheme } from '../../utils/colorScheme'
import { createOptionGuard } from '../../utils/options'
import type { FontValue } from '../../fonts'

/** Each margin maps to a `--width-page-<value>` design token; the page scrolls endlessly. */
export const MARGIN_OPTIONS = [
  { value: 'wide', label: 'Wide' },
  { value: 'normal', label: 'Normal' },
  { value: 'narrow', label: 'Narrow' },
  { value: 'none', label: 'None' },
] as const

export type MarginValue = (typeof MARGIN_OPTIONS)[number]['value']
export const isMarginValue = createOptionGuard(MARGIN_OPTIONS)

/**
 * Line spacing as a multiple of the text size (labels show the real value of
 * the `--line-height-<value>` token). Values are stored, so relabel freely but
 * don't rename them.
 */
export const LINE_SPACING_OPTIONS = [
  { value: 'tight', label: '1.4' },
  { value: 'normal', label: '1.7' },
  { value: 'relaxed', label: '2.0' },
  { value: 'loose', label: '2.4' },
] as const

export type LineSpacingValue = (typeof LINE_SPACING_OPTIONS)[number]['value']
export const isLineSpacingValue = createOptionGuard(LINE_SPACING_OPTIONS)

/** The browser tab's title when none is set (also in index.html, for the first paint). */
export const APP_NAME = 'Write'

/** Long enough for a name or phrase; tabs show far less. */
export const TAB_TITLE_MAX_LENGTH = 60

/**
 * Blur on the background picture or video, in px at normal zoom; fine steps,
 * since even 1px softens a lot, and finer still when typed.
 */
export const BACKGROUND_BLUR_RANGE = {
  min: 0,
  max: 40,
  step: 0.5,
  precision: 0.1,
} as const

/** How opaque the background media is over the page color, in %; any whole percent can be typed. */
export const BACKGROUND_OPACITY_RANGE = {
  min: 0,
  max: 100,
  step: 10,
  precision: 1,
} as const

/** How fast a background video plays, as a multiple of its normal speed. */
export const BACKGROUND_VIDEO_SPEED_RANGE = {
  min: 0.25,
  max: 2,
  step: 0.25,
  precision: 0.05,
} as const

/** Number of user-filled color boxes in the text color menu. */
export const CUSTOM_TEXT_COLOR_SLOT_COUNT = 7

/** Suggested page colors: one full swatch row, like the custom slots. */
export const SUGGESTED_PAGE_COLOR_COUNT = CUSTOM_TEXT_COLOR_SLOT_COUNT

/** Each slot holds a #rrggbb(aa) color, or null while empty. */
export type CustomTextColors = readonly (string | null)[]

export type Appearance = {
  /** The interface around the page: sidebar, toolbar, menus. */
  appFont: FontValue
  /** The writing and title; text without its own font uses it ("Default"). */
  editorFont: FontValue
  margins: MarginValue
  lineSpacing: LineSpacingValue
  /** A half-line gap between paragraphs. */
  hasParagraphSpacing: boolean
  /** Book-style first-line indent on paragraphs that follow a paragraph. */
  hasParagraphIndent: boolean
  backgroundColor: string
  textColor: string
  customTextColors: CustomTextColors
  /** How each text style looks (size, weight, font, color). */
  textStyles: TextStyles
  /** The browser tab's title; empty for APP_NAME. */
  tabTitle: string
  /** Blur on the background picture or video (px, BACKGROUND_BLUR_RANGE). */
  backgroundBlur: number
  /** How opaque the background media is over the page color (%, BACKGROUND_OPACITY_RANGE). */
  backgroundOpacity: number
  /** Whether a background video holds still; a first visit follows the system's reduced-motion setting. */
  isBackgroundVideoPaused: boolean
  /** A background video's speed (× normal, BACKGROUND_VIDEO_SPEED_RANGE). */
  backgroundVideoSpeed: number
}

/**
 * Page colors for a first visit, following the system's light or dark mode:
 * warm oat when light, a soft charcoal when dark. Saved colors win.
 */
export const DEFAULT_PAGE_COLORS: Record<
  ColorScheme,
  Pick<Appearance, 'backgroundColor' | 'textColor'>
> = {
  // Oat
  light: { backgroundColor: '#ede3d6', textColor: '#594a36' },
  // Charcoal
  dark: { backgroundColor: '#222121', textColor: '#acacac' },
}

export const DEFAULT_APPEARANCE: Appearance = {
  appFont: 'inter',
  editorFont: 'lora',
  margins: 'normal',
  lineSpacing: 'tight',
  hasParagraphSpacing: false,
  hasParagraphIndent: false,
  ...DEFAULT_PAGE_COLORS.light,
  customTextColors: Array<string | null>(CUSTOM_TEXT_COLOR_SLOT_COUNT).fill(
    null,
  ),
  textStyles: DEFAULT_TEXT_STYLES,
  tabTitle: '',
  backgroundBlur: 0,
  // Half the page color showing through a busy picture, so writing stays readable.
  backgroundOpacity: 50,
  isBackgroundVideoPaused: false,
  backgroundVideoSpeed: 1,
}
