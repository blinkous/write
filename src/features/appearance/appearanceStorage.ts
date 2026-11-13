import { z } from 'zod'
import { readStoredValue, writeStoredValue } from '../../lib/localStore'
import { deriveCozyTextColor } from '../../lib/cozyPalette'
import { isHexColor } from '../../utils/color'
import { getSystemColorScheme, type ColorScheme } from '../../utils/colorScheme'
import {
  CUSTOM_TEXT_COLOR_SLOT_COUNT,
  DEFAULT_APPEARANCE,
  DEFAULT_PAGE_COLORS,
  isLineSpacingValue,
  isMarginValue,
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

export function loadAppearance(
  colorScheme = getSystemColorScheme(),
): Appearance {
  const {
    backgroundColor,
    textColor,
    hasParagraphSpacing,
    paragraphSpacing,
    editorFont,
    entryFont,
    font,
    ...stored
  } = readStoredValue(
    APPEARANCE_STORAGE_KEY,
    appearanceSchema,
    // Every field falls back on its own, so parsing nothing gives all the defaults.
    appearanceSchema.parse({}),
  )
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

export function saveAppearance(appearance: Appearance): void {
  writeStoredValue(APPEARANCE_STORAGE_KEY, appearance)
}
