import type { Appearance } from './appearanceOptions'
import { FONT_OPTIONS } from './fontOptions'

/** Pushes the appearance into the design-system CSS variables on the root element. */
export function applyAppearance({
  font,
  textSize,
  margins,
  lineSpacing,
  paragraphSpacing,
  backgroundColor,
  textColor,
}: Appearance): void {
  const { style } = document.documentElement
  const fontOption =
    FONT_OPTIONS.find(({ value }) => value === font) ?? FONT_OPTIONS[0]
  style.setProperty('--font-editor', fontOption.family)
  style.setProperty('--font-size-editor', `var(--text-size-${textSize})`)
  style.setProperty('--width-page', `var(--width-page-${margins})`)
  style.setProperty('--line-height-editor', `var(--line-height-${lineSpacing})`)
  style.setProperty(
    '--space-paragraph',
    `var(--space-paragraph-${paragraphSpacing})`,
  )
  style.setProperty('--color-background', backgroundColor)
  style.setProperty('--color-text', textColor)
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', backgroundColor)
}
