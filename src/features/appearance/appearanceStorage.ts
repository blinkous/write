import { z } from 'zod'
import { readStoredValue, writeStoredValue } from '../../lib/localStore'
import { deriveCozyTextColor } from '../../lib/cozyPalette'
import { textStylesSchema } from '../../text-styles'
import { isHexColor } from '../../utils/color'
import { getSystemColorScheme, type ColorScheme } from '../../utils/colorScheme'
import {
  BACKGROUND_BLUR_RANGE,
  BACKGROUND_FADE_RANGE,
  CUSTOM_TEXT_COLOR_SLOT_COUNT,
  DEFAULT_APPEARANCE,
  DEFAULT_PAGE_COLORS,
  isLineSpacingValue,
  isMarginValue,
  TAB_TITLE_MAX_LENGTH,
  type Appearance,
  type LineSpacingValue,
  type MarginValue,
} from './appearanceOptions'
import { isFontValue, type FontValue } from '../../fonts'

const APPEARANCE_STORAGE_KEY = 'write.appearance.v1'

const hexColorSchema = z.string().refine(isHexColor)

/* Always exactly one value per slot; anything that isn't a hex color is an empty slot. */
const customTextColorsSchema = z
  .unknown()
  .optional()
  .transform((value) =>
    Array.from({ length: CUSTOM_TEXT_COLOR_SLOT_COUNT }, (_, slotIndex) => {
      const slotColor = Array.isArray(value) ? value[slotIndex] : null
      return typeof slotColor === 'string' && isHexColor(slotColor)
        ? slotColor
        : null
    }),
  )

/* Each field falls back on its own so one stale value doesn't reset everything. */
const appearanceSchema = z.object({
  appFont: z.custom<FontValue>(isFontValue).catch(DEFAULT_APPEARANCE.appFont),
  editorFont: z.unknown().optional(),
  /** Briefly saved under this name before "Editor". */
  entryFont: z.unknown().optional(),
  /** Legacy (before the app and entries had their own fonts): the writing's font. */
  font: z.unknown().optional(),
  margins: z
    .custom<MarginValue>(isMarginValue)
    .catch(DEFAULT_APPEARANCE.margins),
  lineSpacing: z
    .custom<LineSpacingValue>(isLineSpacingValue)
    .catch(DEFAULT_APPEARANCE.lineSpacing),
  hasParagraphSpacing: z.boolean().optional(),
  hasParagraphIndent: z.boolean().catch(DEFAULT_APPEARANCE.hasParagraphIndent),
  /** Legacy (before paragraph spacing became on/off): none | small | normal | large. */
  paragraphSpacing: z.unknown().optional(),
  // Resolved together below, so the text always suits the background.
  backgroundColor: hexColorSchema.optional().catch(undefined),
  textColor: hexColorSchema.optional().catch(undefined),
  customTextColors: customTextColorsSchema,
  textStyles: textStylesSchema,
  tabTitle: z
    .string()
    .max(TAB_TITLE_MAX_LENGTH)
    .catch(DEFAULT_APPEARANCE.tabTitle),
  backgroundBlur: z
    .number()
    .int()
    .min(BACKGROUND_BLUR_RANGE.min)
    .max(BACKGROUND_BLUR_RANGE.max)
    .catch(DEFAULT_APPEARANCE.backgroundBlur),
  backgroundFade: z
    .number()
    .int()
    .min(BACKGROUND_FADE_RANGE.min)
    .max(BACKGROUND_FADE_RANGE.max)
    .catch(DEFAULT_APPEARANCE.backgroundFade),
})

/*
 * Paragraph spacing used to be a size (none/small/normal/large); now it's on or
 * off. A stored size migrates to "on" unless it was "none". The legacy field is
 * dropped on the next save; running this again on migrated data changes nothing.
 */
function migrateParagraphSpacing(
  hasParagraphSpacing: boolean | undefined,
  legacyParagraphSpacing: unknown,
): boolean {
  if (hasParagraphSpacing !== undefined) return hasParagraphSpacing
  if (legacyParagraphSpacing === undefined)
    return DEFAULT_APPEARANCE.hasParagraphSpacing
  return legacyParagraphSpacing !== 'none'
}

/*
 * There used to be one font, always the writing's (for a while it also set the
 * interface), and briefly `entryFont`. The newest saved one becomes the
 * editor font; the app font starts at its default.
 */
function migrateEditorFont(...savedFonts: unknown[]): FontValue {
  return savedFonts.find(isFontValue) ?? DEFAULT_APPEARANCE.editorFont
}

/*
 * Nothing saved (a first visit): the default colors for the system's light or
 * dark mode. A saved background without a usable text color gets its match.
 */
function resolvePageColors(
  backgroundColor: string | undefined,
  textColor: string | undefined,
  colorScheme: ColorScheme,
): Pick<Appearance, 'backgroundColor' | 'textColor'> {
  if (!backgroundColor) return DEFAULT_PAGE_COLORS[colorScheme]
  return {
    backgroundColor,
    textColor: textColor ?? deriveCozyTextColor(backgroundColor),
  }
}

/* Stored (or imported) settings, with migrations and first-visit colors resolved. */
function toAppearance(
  {
    backgroundColor,
    textColor,
    hasParagraphSpacing,
    paragraphSpacing,
    editorFont,
    entryFont,
    font,
    ...stored
  }: z.infer<typeof appearanceSchema>,
  colorScheme: ColorScheme,
): Appearance {
  return {
    ...stored,
    ...resolvePageColors(backgroundColor, textColor, colorScheme),
    editorFont: migrateEditorFont(editorFont, entryFont, font),
    hasParagraphSpacing: migrateParagraphSpacing(
      hasParagraphSpacing,
      paragraphSpacing,
    ),
  }
}

export function loadAppearance(
  colorScheme = getSystemColorScheme(),
): Appearance {
  const stored = readStoredValue(
    APPEARANCE_STORAGE_KEY,
    appearanceSchema,
    // Every field falls back on its own, so parsing nothing gives all the defaults.
    appearanceSchema.parse({}),
  )
  return toAppearance(stored, colorScheme)
}

/**
 * Settings from elsewhere (e.g. an imported settings file), read like stored
 * ones: each bad value falls back on its own. Null if it isn't settings at all.
 */
export function parseAppearance(
  rawAppearance: unknown,
  colorScheme = getSystemColorScheme(),
): Appearance | null {
  const result = appearanceSchema.safeParse(rawAppearance)
  return result.success ? toAppearance(result.data, colorScheme) : null
}

export function saveAppearance(appearance: Appearance): void {
  writeStoredValue(APPEARANCE_STORAGE_KEY, appearance)
}
