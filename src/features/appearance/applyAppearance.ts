import { deriveCozyThemeColors } from '../../lib/cozyPalette'
import { deriveReadableMutedColor } from '../../lib/readableMuted'
import type { Appearance } from './appearanceOptions'
import { getFontOption } from '../../fonts'

/** Pushes the appearance into the design-system CSS variables on the root element. */
export function applyAppearance({
  appFont,
  editorFont,
  margins,
  lineSpacing,
  hasParagraphSpacing,
  hasParagraphIndent,
  backgroundColor,
  textColor,
}: Appearance): void {
  const { style } = document.documentElement
  style.setProperty('--font-ui', getFontOption(appFont).family)
  style.setProperty('--font-editor', getFontOption(editorFont).family)
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
  // Muted text when the system asks for more contrast; soft otherwise (see tokens.css).
  style.setProperty(
    '--color-muted-readable',
    deriveReadableMutedColor(backgroundColor, textColor),
  )
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
