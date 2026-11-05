import { z } from 'zod'
import { readStoredValue, writeStoredValue } from '../../lib/localStore'
import { isHexColor } from '../../utils/color'
import {
  DEFAULT_APPEARANCE,
  isLineSpacingValue,
  isMarginValue,
  isParagraphSpacingValue,
  isTextSizeValue,
  type Appearance,
  type LineSpacingValue,
  type MarginValue,
  type ParagraphSpacingValue,
  type TextSizeValue,
} from './appearanceOptions'
import { isFontValue, type FontValue } from './fontOptions'

const APPEARANCE_STORAGE_KEY = 'write.appearance.v1'

const hexColorSchema = z.string().refine(isHexColor)

/* Each field falls back on its own so one stale value doesn't reset everything. */
const appearanceSchema = z.object({
  font: z.custom<FontValue>(isFontValue).catch(DEFAULT_APPEARANCE.font),
  textSize: z
    .custom<TextSizeValue>(isTextSizeValue)
    .catch(DEFAULT_APPEARANCE.textSize),
  margins: z
    .custom<MarginValue>(isMarginValue)
    .catch(DEFAULT_APPEARANCE.margins),
  lineSpacing: z
    .custom<LineSpacingValue>(isLineSpacingValue)
    .catch(DEFAULT_APPEARANCE.lineSpacing),
  paragraphSpacing: z
    .custom<ParagraphSpacingValue>(isParagraphSpacingValue)
    .catch(DEFAULT_APPEARANCE.paragraphSpacing),
  backgroundColor: hexColorSchema.catch(DEFAULT_APPEARANCE.backgroundColor),
  textColor: hexColorSchema.catch(DEFAULT_APPEARANCE.textColor),
})

export function loadAppearance(): Appearance {
  return readStoredValue(
    APPEARANCE_STORAGE_KEY,
    appearanceSchema,
    DEFAULT_APPEARANCE,
  )
}

export function saveAppearance(appearance: Appearance): void {
  writeStoredValue(APPEARANCE_STORAGE_KEY, appearance)
}
