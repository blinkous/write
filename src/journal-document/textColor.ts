import { Color, TextStyle } from '@tiptap/extension-text-style'
import { isHexColor } from '../utils/color'

/**
 * Theme colors are stored by name, not value, so text colored with one
 * follows the page: the shades are derived from the page background in CSS.
 */
export const THEME_TEXT_COLORS = [
  'theme-1',
  'theme-2',
  'theme-3',
  'theme-4',
  'theme-5',
  'theme-6',
  'theme-7',
] as const
export type ThemeTextColor = (typeof THEME_TEXT_COLORS)[number]

export function isThemeTextColor(value: unknown): value is ThemeTextColor {
  return THEME_TEXT_COLORS.some((themeColor) => themeColor === value)
}

/** The design token that renders a theme color, derived from the page background. */
export function getThemeColorToken(themeColor: ThemeTextColor): string {
  return `var(--color-${themeColor})`
}

/**
 * The CSS color for a stored text color: a theme name maps to its design
 * token, a hex color is used as is. Anything else is ignored (null).
 */
export function resolveTextColor(storedColor: unknown): string | null {
  if (isThemeTextColor(storedColor)) return getThemeColorToken(storedColor)
  return typeof storedColor === 'string' && isHexColor(storedColor)
    ? storedColor
    : null
}

/*
 * TextStyle renders color through an inline `style` attribute, which the app's
 * CSP blocks. This mark view sets it through the CSSOM instead, which CSP
 * allows and which can only ever set the one `color` property.
 */
const CspSafeTextStyle = TextStyle.extend({
  addMarkView() {
    return ({ mark }) => {
      const dom = document.createElement('span')
      const cssColor = resolveTextColor(mark.attrs.color)
      if (cssColor) dom.style.color = cssColor
      return { dom, contentDOM: dom }
    }
  },
})

/** Per-text color. Text without one inherits the page text color. */
export const textColorExtensions = [CspSafeTextStyle, Color]
