import { createOptionGuard } from '../../utils/options'
import type { FontValue } from './fontOptions'

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

/** Number of user-filled color boxes in the text color menu. */
export const CUSTOM_TEXT_COLOR_SLOT_COUNT = 7

/** Each slot holds a #rrggbb color, or null while empty. */
export type CustomTextColors = readonly (string | null)[]

export type Appearance = {
  font: FontValue
  margins: MarginValue
  lineSpacing: LineSpacingValue
  /** A half-line gap between paragraphs. */
  hasParagraphSpacing: boolean
  /** Book-style first-line indent on paragraphs that follow a paragraph. */
  hasParagraphIndent: boolean
  backgroundColor: string
  textColor: string
  customTextColors: CustomTextColors
}

export const DEFAULT_APPEARANCE: Appearance = {
  font: 'lora',
  margins: 'normal',
  lineSpacing: 'normal',
  hasParagraphSpacing: true,
  hasParagraphIndent: false,
  // Dusty rose
  backgroundColor: '#f0dfdb',
  textColor: '#4a3236',
  customTextColors: Array<string | null>(CUSTOM_TEXT_COLOR_SLOT_COUNT).fill(
    null,
  ),
}
