import { Color, TextStyle } from '@tiptap/extension-text-style'
import { ResetTextLook } from './resetTextLook'
import { resolveTextColor } from './textColor'
import {
  EMPHASIS_OFF_ATTRIBUTES,
  EMPHASIS_OFF_DATA_ATTRIBUTES,
  TextEmphasis,
} from './textEmphasis'
import { resolveTextFont, TextFont } from './textFont'
import { NO_GLOW, resolveTextGlow, TextGlow } from './textGlow'
import {
  resolveTextLetterSpacing,
  TextLetterSpacing,
} from './textLetterSpacing'

/*
 * TextStyle renders through an inline `style` attribute, which the app's CSP
 * blocks. This mark view sets the text's color, font, glow, letter spacing and
 * emphasis turned off through the
 * CSSOM instead, which CSP allows and which can only ever set those properties.
 */
const CspSafeTextStyle = TextStyle.extend({
  // Also read spans carrying only a font, glow, letter spacing or emphasis off (copied within the app), not just styled spans.
  parseHTML() {
    return [
      ...(this.parent?.() ?? []),
      { tag: 'span[data-font]', consuming: false },
      { tag: 'span[data-glow]', consuming: false },
      { tag: 'span[data-letter-spacing]', consuming: false },
      ...EMPHASIS_OFF_DATA_ATTRIBUTES.map((dataAttribute) => ({
        tag: `span[${dataAttribute}]`,
        consuming: false,
      })),
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
      // No glow, where its style has one.
      if (mark.attrs.glow === NO_GLOW) dom.style.textShadow = 'none'
      const cssLetterSpacing = resolveTextLetterSpacing(
        mark.attrs.letterSpacing,
      )
      if (cssLetterSpacing) dom.style.letterSpacing = cssLetterSpacing
      // Its style's bold or italic, turned off (its lines are skipped instead; see textEmphasis).
      if (mark.attrs[EMPHASIS_OFF_ATTRIBUTES.bold] === true)
        dom.style.fontWeight = 'normal'
      if (mark.attrs[EMPHASIS_OFF_ATTRIBUTES.italic] === true)
        dom.style.fontStyle = 'normal'
      return { dom, contentDOM: dom }
    }
  },
})

/** Per-text color, font, glow, letter spacing and emphasis off. Text without them follows its text style's. */
export const textStyleExtensions = [
  CspSafeTextStyle,
  Color,
  TextFont,
  TextGlow,
  TextLetterSpacing,
  TextEmphasis,
  ResetTextLook,
]
