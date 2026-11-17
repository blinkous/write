import type { Editor } from '@tiptap/react'
import { FontMenu, type FontValue } from '../../fonts'
import {
  chooseOwnValue,
  useOwnAndStyleValue,
  type TextStyleContext,
} from './ownOrStyleValue'
import { readOwnFont } from './ownFormatting'

type TextFontMenuProps = TextStyleContext & {
  editor: Editor
  /** The entries' font, which text without its own font follows ("Default"). */
  editorFont: FontValue
}

/**
 * The font of the selected text, or the text about to be typed. Default
 * follows its text style's font (the editor font when the style has none),
 * captioned with it; choosing the style's font removes the text's own too.
 */
export function TextFontMenu({
  editor,
  editorFont,
  ...textStyleContext
}: TextFontMenuProps) {
  const { own, style } = useOwnAndStyleValue(
    editor,
    textStyleContext,
    'font',
    readOwnFont,
  )

  return (
    <FontMenu
      label="Text font"
      value={own}
      defaultFont={style ?? editorFont}
      // Null is Default: the style's font.
      onChange={(font) =>
        chooseOwnValue(font ?? style, style, {
          set: (ownFont) =>
            ownFont && editor.chain().setTextFont(ownFont).run(),
          unset: () => editor.chain().unsetTextFont().run(),
        })
      }
      // Return to the text with its selection, so typing continues in the chosen font.
      onClose={() => editor.commands.focus()}
    />
  )
}
