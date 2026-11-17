import { Color, TextStyle } from '@tiptap/extension-text-style'
import { resolveTextColor } from './textColor'
import { resolveTextFont, TextFont } from './textFont'
import { resolveTextGlow, TextGlow } from './textGlow'

/*
 * TextStyle renders through an inline `style` attribute, which the app's CSP
 * blocks. This mark view sets the text's color, font and glow through the
 * CSSOM instead, which CSP allows and which can only ever set those properties.
 */
const CspSafeTextStyle = TextStyle.extend({
  // Also read spans carrying only a font or glow (copied within the app), not just styled spans.
  parseHTML() {
    return [
      ...(this.parent?.() ?? []),
      { tag: 'span[data-font]', consuming: false },
      { tag: 'span[data-glow]', consuming: false },
    ]
  },

  addMarkView() {
    return ({ mark }) => {
      const dom = document.createElement('span')
      const cssColor = resolveTextColor(mark.attrs.color)
      if (cssColor) dom.style.color = cssColor
      const cssFont = resolveTextFont(mark.attrs.font)
      if (cssFont) dom.style.fontFamily = cssFont
      const cssGlow = resolveTextGlow(mark.attrs.glow)
      if (cssGlow) dom.style.textShadow = cssGlow
      return { dom, contentDOM: dom }
    }
  },
})

/** Per-text color, font and glow. Text without them follows its text style's. */
export const textStyleExtensions = [CspSafeTextStyle, Color, TextFont, TextGlow]
