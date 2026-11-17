import type { Editor } from '@tiptap/react'
import { EMPHASES } from '../../journal-document'
import { chainTextStyle, type TextStyle } from './textStyles'

/** The marks that give text a look of its own; links and code stay. */
const OWN_LOOK_MARKS = ['textStyle', 'textCase', ...EMPHASES] as const

/**
 * Gives the selection's blocks this style and removes the text's own look
 * (font, color, glow, case, letter spacing, emphasis), so it looks exactly
 * like the style: the reverse of matching a style to text. Without a
 * selection, the cursor's whole block. The title's one style isn't applied,
 * only returned to (`textStyle` null). One undo step.
 */
export function resetToTextStyle(
  editor: Editor,
  textStyle: TextStyle | null,
): boolean {
  const chain = editor.chain().focus()
  return (textStyle ? chainTextStyle(chain, textStyle) : chain)
    .command(({ tr }) => {
      const { from, to, empty, $from, $to } = tr.selection
      const [rangeFrom, rangeTo] = empty
        ? [$from.start(), $to.end()]
        : [from, to]
      for (const markName of OWN_LOOK_MARKS) {
        const markType = tr.doc.type.schema.marks[markName]
        if (markType) tr.removeMark(rangeFrom, rangeTo, markType)
      }
      // Text typed next follows the style too.
      tr.setStoredMarks([])
      return true
    })
    .run()
}
