import type { Editor } from '@tiptap/react'
import { resolveTextLetterSpacing } from '../../journal-document'
import { LetterSpacingMenu } from '../../text-styles'
import {
  chooseOwnValue,
  useOwnAndStyleValue,
  type TextStyleContext,
} from './ownOrStyleValue'

/**
 * Gives the selected text, or the text about to be typed, its own letter
 * spacing (% of its size; the same control as each text style's). It shows
 * the text's own spacing, or its style's; stepping to the style's, or the
 * reset, removes the text's own (see chooseOwnValue).
 */
export function TextLetterSpacingPicker({
  editor,
  ...textStyleContext
}: TextStyleContext & { editor: Editor }) {
  const { own, style } = useOwnAndStyleValue(
    editor,
    textStyleContext,
    'letterSpacing',
    (currentEditor): number | null => {
      const { letterSpacing } = currentEditor.getAttributes('textStyle')
      return resolveTextLetterSpacing(letterSpacing) === null
        ? null
        : Number(letterSpacing)
    },
  )
  const unsetLetterSpacing = () => editor.chain().unsetTextLetterSpacing().run()

  return (
    <LetterSpacingMenu
      label="Letter spacing"
      value={own ?? style}
      onChange={(letterSpacing) =>
        chooseOwnValue(letterSpacing, style, {
          set: (ownLetterSpacing) =>
            editor.chain().setTextLetterSpacing(ownLetterSpacing).run(),
          unset: unsetLetterSpacing,
        })
      }
      onReset={unsetLetterSpacing}
      canReset={own !== null}
      // Return to the text with its selection, so typing continues with the chosen spacing.
      onClose={() => editor.commands.focus()}
    />
  )
}
