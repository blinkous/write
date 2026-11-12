import { deriveCozyThemeColors } from '../../lib/cozyPalette'
import type { Appearance } from './appearanceOptions'
import { FONT_OPTIONS } from './fontOptions'

/** Pushes the appearance into the design-system CSS variables on the root element. */
export function applyAppearance({
  font,
  margins,
  lineSpacing,
  hasParagraphSpacing,
  hasParagraphIndent,
  backgroundColor,
  textColor,
}: Appearance): void {
  const { style } = document.documentElement
  const fontOption =
    FONT_OPTIONS.find(({ value }) => value === font) ?? FONT_OPTIONS[0]
  style.setProperty('--font-editor', fontOption.family)
  style.setProperty('--width-page', `var(--width-page-${margins})`)
  style.setProperty('--line-height-editor', `var(--line-height-${lineSpacing})`)
  style.setProperty(
    '--space-paragraph',
    hasParagraphSpacing ? 'var(--space-paragraph-gap)' : '0',
  )
  style.setProperty(
    '--paragraph-indent',
    hasParagraphIndent ? 'var(--size-paragraph-indent)' : '0',
  )
  style.setProperty('--color-background', backgroundColor)
  style.setProperty('--color-text', textColor)
  // Live theme text colors: text colored with one follows the page background.
  deriveCozyThemeColors(backgroundColor, textColor).forEach(
    (themeColor, index) => {
      style.setProperty(`--color-theme-${index + 1}`, themeColor)
    },
  )
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', backgroundColor)
}
