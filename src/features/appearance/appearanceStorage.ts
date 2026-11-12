import { z } from 'zod'
import { readStoredValue, writeStoredValue } from '../../lib/localStore'
import { isHexColor } from '../../utils/color'
import {
  CUSTOM_TEXT_COLOR_SLOT_COUNT,
  DEFAULT_APPEARANCE,
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
  backgroundColor: hexColorSchema.catch(DEFAULT_APPEARANCE.backgroundColor),
  textColor: hexColorSchema.catch(DEFAULT_APPEARANCE.textColor),
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

export function loadAppearance(): Appearance {
  const {
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
