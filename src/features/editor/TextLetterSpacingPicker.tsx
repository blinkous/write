import { useEditorState, type Editor } from '@tiptap/react'
import { resolveTextLetterSpacing } from '../../journal-document'
import { LetterSpacingMenu, type TextStyles } from '../../text-styles'
import { getTextStyleNameAt } from './textStyles'

type TextLetterSpacingPickerProps = {
  editor: Editor
  /** Whether `editor` is the entry's title, whose text style is Title. */
  isTitle: boolean
  /** How each text style looks, for the spacing text without its own follows. */
  textStyles: TextStyles
}

/**
 * Gives the selected text, or the text about to be typed, its own letter
 * spacing (% of its size; the same control as each text style's). It shows
 * the text's own spacing, or its style's; the reset removes the text's own.
 */
export function TextLetterSpacingPicker({
  editor,
  isTitle,
  textStyles,
}: TextLetterSpacingPickerProps) {
  const { ownLetterSpacing, styleLetterSpacing } = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      const { letterSpacing } = currentEditor.getAttributes('textStyle')
      return {
        ownLetterSpacing:
          resolveTextLetterSpacing(letterSpacing) === null
            ? null
            : Number(letterSpacing),
        styleLetterSpacing:
          textStyles[getTextStyleNameAt(currentEditor, isTitle)].letterSpacing,
      }
    },
  })

  return (
    <LetterSpacingMenu
      label="Letter spacing"
      value={ownLetterSpacing ?? styleLetterSpacing}
      onChange={(letterSpacing) =>
        editor.chain().setTextLetterSpacing(letterSpacing).run()
      }
      // Removes the text's own spacing, so it follows its style again.
      onReset={() => editor.chain().unsetTextLetterSpacing().run()}
      canReset={ownLetterSpacing !== null}
      // Return to the text with its selection, so typing continues with the chosen spacing.
      onClose={() => editor.commands.focus()}
    />
  )
}
