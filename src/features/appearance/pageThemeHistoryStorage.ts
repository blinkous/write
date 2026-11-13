import { z } from 'zod'
import { isFontValue, type FontValue } from '../../fonts'
import {
  hasStoredValue,
  readStoredValue,
  writeStoredValue,
} from '../../lib/localStore'
import { textStylesSchema } from '../../text-styles'
import { isHexColor } from '../../utils/color'
import {
  EMPTY_PAGE_THEME_HISTORY,
  PAGE_THEME_HISTORY_LIMIT,
  type PageTheme,
  type PageThemeHistory,
} from './pageThemeHistory'

const PAGE_THEME_HISTORY_STORAGE_KEY = 'write.pageThemeHistory.v1'
/*
 * Before the font joined the page theme, history held colors only. It's read
 * once (while the theme history doesn't exist yet) and left as a backup.
 */
const PAGE_COLOR_HISTORY_STORAGE_KEY = 'write.pageColorHistory.v1'

/** What steps saved before a setting existed take for it: the current value. */
type CurrentSettings = Pick<PageTheme, 'appFont' | 'editorFont' | 'textStyles'>

// Explicitly optional: in zod 4 a bare unknown() key is still required.
const optionalUnknown = z.unknown().optional()

/**
 * Steps that predate a font (or have an unknown one) get the current font, so
 * undoing an old color change never also changes a font. A step's single
 * older `font` (or briefly `entryFont`) was the writing's, so it becomes the
 * editor font.
 */
function createHistorySchema(current: CurrentSettings) {
  const pageThemeSchema = z.object({
    appFont: optionalUnknown.transform((font): FontValue =>
      isFontValue(font) ? font : current.appFont,
    ),
    editorFont: optionalUnknown,
    entryFont: optionalUnknown,
    font: optionalUnknown,
    textStyles: optionalUnknown.transform((textStyles) =>
      textStyles === undefined
        ? current.textStyles
        : textStylesSchema.parse(textStyles),
    ),
    backgroundColor: z.string().refine(isHexColor),
    textColor: z.string().refine(isHexColor),
  })

  /* Drops unreadable steps rather than the whole history, and never keeps more than the limit. */
  const stepsSchema = z
    .array(z.unknown())
    .catch([])
    .transform((rawSteps) =>
      rawSteps.flatMap((rawStep): PageTheme[] => {
        const result = pageThemeSchema.safeParse(rawStep)
        if (!result.success) return []
        const { editorFont, entryFont, font, ...step } = result.data
        const stepEditorFont =
          [editorFont, entryFont, font].find(isFontValue) ?? current.editorFont
        return [{ ...step, editorFont: stepEditorFont }]
      }),
    )

  return z.object({
    past: stepsSchema.transform((steps) =>
      steps.slice(-PAGE_THEME_HISTORY_LIMIT),
    ),
    future: stepsSchema.transform((steps) =>
      steps.slice(0, PAGE_THEME_HISTORY_LIMIT),
    ),
  })
}

/** Undo/redo steps survive a refresh; an edit in progress doesn't need to. */
export function loadPageThemeHistory(
  current: CurrentSettings,
): PageThemeHistory {
  const storageKey = hasStoredValue(PAGE_THEME_HISTORY_STORAGE_KEY)
    ? PAGE_THEME_HISTORY_STORAGE_KEY
    : PAGE_COLOR_HISTORY_STORAGE_KEY
  const { past, future } = readStoredValue(
    storageKey,
    createHistorySchema(current),
    {
      past: [],
      future: [],
    },
  )
  return { ...EMPTY_PAGE_THEME_HISTORY, past, future }
}

export function savePageThemeHistory({ past, future }: PageThemeHistory): void {
  writeStoredValue(PAGE_THEME_HISTORY_STORAGE_KEY, { past, future })
}
