import type { Editor } from '@tiptap/react'
import {
  AS_TYPED_CASE,
  isOwnTextCase,
  type OwnTextCase,
} from '../../journal-document'
import { TextCaseMenu } from '../../text-styles'
import {
  chooseOwnValue,
  useOwnAndStyleValue,
  type TextStyleContext,
} from './ownOrStyleValue'

/**
 * Displays the selection (or the text about to be typed) in a case. Only the
 * display changes; the letters typed are kept, so "As typed" restores them
 * even where its text style has a case. It shows the text's own case, or its
 * style's; choosing the style's removes the text's own (see chooseOwnValue).
 */
export function TextCasePicker({
  editor,
  ...textStyleContext
}: TextStyleContext & { editor: Editor }) {
  const { own, style } = useOwnAndStyleValue(
    editor,
    textStyleContext,
    'textCase',
    (currentEditor): OwnTextCase | null => {
      const { textCase } = currentEditor.getAttributes('textCase')
      return isOwnTextCase(textCase) ? textCase : null
    },
  )

  return (
    <TextCaseMenu
      label="Text case"
      value={own === AS_TYPED_CASE ? null : (own ?? style)}
      // Null is as typed.
      onSelect={(textCase) =>
        chooseOwnValue(textCase, style, {
          set: (ownCase) =>
            editor
              .chain()
              .setTextCase(ownCase ?? AS_TYPED_CASE)
              .run(),
          unset: () => editor.chain().unsetTextCase().run(),
        })
      }
      // Return to the text with its selection, so typing continues in the chosen case.
      onClose={() => editor.commands.focus()}
    />
  )
}
