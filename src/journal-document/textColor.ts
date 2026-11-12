import { Color, TextStyle } from '@tiptap/extension-text-style'
import { isHexColor } from '../utils/color'
import { resolveTextFont, TextFont } from './textFont'

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
 * TextStyle renders through an inline `style` attribute, which the app's CSP
 * blocks. This mark view sets the text's color and font through the CSSOM
 * instead, which CSP allows and which can only ever set those properties.
 */
const CspSafeTextStyle = TextStyle.extend({
  // Also read spans carrying only a font (copied within the app), not just styled spans.
  parseHTML() {
    return [
      ...(this.parent?.() ?? []),
      { tag: 'span[data-font]', consuming: false },
    ]
  },

  addMarkView() {
    return ({ mark }) => {
      const dom = document.createElement('span')
      const cssColor = resolveTextColor(mark.attrs.color)
      if (cssColor) dom.style.color = cssColor
      const cssFont = resolveTextFont(mark.attrs.font)
      if (cssFont) dom.style.fontFamily = cssFont
      return { dom, contentDOM: dom }
    }
  },
})

/** Per-text color and font. Text without them follows the page's. */
export const textStyleExtensions = [CspSafeTextStyle, Color, TextFont]
