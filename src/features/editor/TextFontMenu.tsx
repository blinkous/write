import { useEditorState, type Editor } from '@tiptap/react'
import { FontMenu, isFontValue, type FontValue } from '../../fonts'

type TextFontMenuProps = {
  editor: Editor
  /** The entries' font, which text without its own font follows ("Default"). */
  editorFont: FontValue
}

/** The font of the selected text, or the text about to be typed. Default follows the editor font. */
export function TextFontMenu({ editor, editorFont }: TextFontMenuProps) {
  const textFont = useEditorState({
    editor,
    selector: ({ editor: currentEditor }): FontValue | null => {
      const { font } = currentEditor.getAttributes('textStyle')
      return isFontValue(font) ? font : null
    },
  })

  return (
    <FontMenu
      label="Text font"
      value={textFont}
      defaultFont={editorFont}
      onChange={(font) =>
        font
          ? editor.chain().setTextFont(font).run()
          : editor.chain().unsetTextFont().run()
      }
      // Return to the text with its selection, so typing continues in the chosen font.
      onClose={() => editor.commands.focus()}
    />
  )
}
