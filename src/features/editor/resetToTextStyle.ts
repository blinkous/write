import type { Editor } from '@tiptap/react'
import { chainTextStyle, type TextStyle } from './textStyles'

/**
 * Gives the selection's blocks this style and removes the text's own look,
 * so it looks exactly like the style: the reverse of matching a style to
 * text. Without a selection, the cursor's whole block. The title's one style
 * isn't applied, only returned to (`textStyle` null). One undo step.
 */
export function resetToTextStyle(
  editor: Editor,
  textStyle: TextStyle | null,
): boolean {
  const chain = editor.chain().focus()
  return (textStyle ? chainTextStyle(chain, textStyle) : chain)
    .resetTextLook()
    .run()
}
