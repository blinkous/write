import { createOptionGuard } from '../../utils/options'
import type { FontValue } from './fontOptions'

/** Each size maps to a `--text-size-<value>` design token. */
export const TEXT_SIZE_OPTIONS = [
  { value: 'small', label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large', label: 'L' },
  { value: 'extra-large', label: 'XL' },
] as const

export type TextSizeValue = (typeof TEXT_SIZE_OPTIONS)[number]['value']
export const isTextSizeValue = createOptionGuard(TEXT_SIZE_OPTIONS)

/** Each margin maps to a `--width-page-<value>` design token; the page scrolls endlessly. */
export const MARGIN_OPTIONS = [
  { value: 'wide', label: 'Wide' },
  { value: 'normal', label: 'Normal' },
  { value: 'narrow', label: 'Narrow' },
  { value: 'none', label: 'None' },
] as const

export type MarginValue = (typeof MARGIN_OPTIONS)[number]['value']
export const isMarginValue = createOptionGuard(MARGIN_OPTIONS)

/** Space between lines; each maps to a `--line-height-<value>` design token. */
export const LINE_SPACING_OPTIONS = [
  { value: 'tight', label: 'Tight' },
  { value: 'normal', label: 'Normal' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'loose', label: 'Loose' },
] as const

export type LineSpacingValue = (typeof LINE_SPACING_OPTIONS)[number]['value']
export const isLineSpacingValue = createOptionGuard(LINE_SPACING_OPTIONS)

/** Space between paragraphs; each maps to a `--space-paragraph-<value>` design token. */
export const PARAGRAPH_SPACING_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'small', label: 'Small' },
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Large' },
] as const

export type ParagraphSpacingValue =
  (typeof PARAGRAPH_SPACING_OPTIONS)[number]['value']
export const isParagraphSpacingValue = createOptionGuard(
  PARAGRAPH_SPACING_OPTIONS,
)

export type Appearance = {
  font: FontValue
  textSize: TextSizeValue
  margins: MarginValue
  lineSpacing: LineSpacingValue
  paragraphSpacing: ParagraphSpacingValue
  backgroundColor: string
  textColor: string
}

export const DEFAULT_APPEARANCE: Appearance = {
  font: 'lora',
  textSize: 'medium',
  margins: 'normal',
  lineSpacing: 'normal',
  paragraphSpacing: 'normal',
  // Dusty rose
  backgroundColor: '#f0dfdb',
  textColor: '#4a3236',
}
