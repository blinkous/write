import { z } from 'zod'
import { backgroundFileIdSchema } from './backgroundFiles'
import { isFontValue, type FontValue } from '../../fonts'
import {
  hasStoredValue,
  readStoredValue,
  writeStoredValue,
} from '../../lib/localStore'
import { textStylesSchema } from '../../text-styles'
import { isHexColor, isOpaqueHexColor } from '../../utils/color'
import {
  BACKGROUND_BLUR_RANGE,
  BACKGROUND_OPACITY_RANGE,
  BACKGROUND_VIDEO_SPEED_RANGE,
  TAB_TITLE_MAX_LENGTH,
} from './appearanceOptions'
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
type CurrentSettings = Omit<PageTheme, 'backgroundColor' | 'textColor'>

// Explicitly optional: in zod 4 a bare unknown() key is still required.
const optionalUnknown = z.unknown().optional()

/** A step's value, or the current one if the step predates the setting or holds a bad value. */
function valueOrCurrent<Value>(schema: z.ZodType<Value>, current: Value) {
  return optionalUnknown.transform((value): Value => {
    const result = schema.safeParse(value)
    return result.success ? result.data : current
  })
}

const tabTitleSchema = z.string().max(TAB_TITLE_MAX_LENGTH)
const backgroundBlurSchema = z
  .number()
  .min(BACKGROUND_BLUR_RANGE.min)
  .max(BACKGROUND_BLUR_RANGE.max)
const backgroundOpacitySchema = z
  .number()
  .min(BACKGROUND_OPACITY_RANGE.min)
  .max(BACKGROUND_OPACITY_RANGE.max)
const backgroundVideoSpeedSchema = z
  .number()
  .min(BACKGROUND_VIDEO_SPEED_RANGE.min)
  .max(BACKGROUND_VIDEO_SPEED_RANGE.max)

/**
 * Steps that predate a setting (or have an unknown value for it) get its
 * current value, so undoing an old color change never also changes a font,
 * the tab title or the background. A step's single
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
    themeTextStyles: optionalUnknown.transform((themeTextStyles) =>
      themeTextStyles === undefined
        ? current.themeTextStyles
        : textStylesSchema.parse(themeTextStyles),
    ),
    backgroundColor: z.string().refine(isOpaqueHexColor),
    textColor: z.string().refine(isHexColor),
    tabTitle: valueOrCurrent(tabTitleSchema, current.tabTitle),
    backgroundBlur: valueOrCurrent(
      backgroundBlurSchema,
      current.backgroundBlur,
    ),
    backgroundOpacity: valueOrCurrent(
      backgroundOpacitySchema,
      current.backgroundOpacity,
    ),
    isBackgroundVideoPaused: valueOrCurrent(
      z.boolean(),
      current.isBackgroundVideoPaused,
    ),
    backgroundVideoSpeed: valueOrCurrent(
      backgroundVideoSpeedSchema,
      current.backgroundVideoSpeed,
    ),
    backgroundFileId: valueOrCurrent(
      backgroundFileIdSchema,
      current.backgroundFileId,
    ),
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
