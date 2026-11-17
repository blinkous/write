import { useEditorState, type Editor } from '@tiptap/react'
import { isTextCase, type TextCase } from '../../journal-document'
import { TextCaseMenu } from '../../text-styles'

/**
 * Displays the selection (or the text about to be typed) in a case. Only the
 * display changes; the letters typed are kept, so "As typed" restores them
 * (or the text style's case, if it has one).
 */
export function TextCasePicker({ editor }: { editor: Editor }) {
  const activeTextCase = useEditorState({
    editor,
    selector: ({ editor: currentEditor }): TextCase | null => {
      const { textCase } = currentEditor.getAttributes('textCase')
      return isTextCase(textCase) ? textCase : null
    },
  })

  return (
    <TextCaseMenu
      label="Text case"
      value={activeTextCase}
      onSelect={(textCase) => {
        if (textCase) editor.chain().setTextCase(textCase).run()
        else editor.chain().unsetTextCase().run()
      }}
      // Return to the text with its selection, so typing continues in the chosen case.
      onClose={() => editor.commands.focus()}
    />
  )
}
