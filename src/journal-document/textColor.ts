import { Color, TextStyle } from '@tiptap/extension-text-style'

/*
 * TextStyle renders color through an inline `style` attribute, which the app's
 * CSP blocks. This mark view sets it through the CSSOM instead, which CSP
 * allows and which can only ever set the one `color` property.
 */
const CspSafeTextStyle = TextStyle.extend({
  addMarkView() {
    return ({ mark }) => {
      const dom = document.createElement('span')
      const { color } = mark.attrs
      if (typeof color === 'string') dom.style.color = color
      return { dom, contentDOM: dom }
    }
  },
})

/** Per-text color. Text without one inherits the page text color. */
export const textColorExtensions = [CspSafeTextStyle, Color]
