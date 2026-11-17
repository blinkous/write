import { Extension } from '@tiptap/core'
import { EMPHASES } from './textEmphasis'

/** The marks that give text a look of its own; links and code stay. */
const OWN_LOOK_MARKS = ['textStyle', 'textCase', ...EMPHASES] as const

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    clearOwnLook: {
      /**
       * Removes the selected text's own look (font, color, glow, case, letter
       * spacing, emphasis), so it looks like its text style; without a
       * selection, the cursor's whole block.
       */
      clearOwnLook: () => ReturnType
    }
  }
}

/** Text back to its text style's look (see the style menu's Update text to match style). */
export const ClearOwnLook = Extension.create({
  name: 'clearOwnLook',

  addCommands() {
    return {
      clearOwnLook:
        () =>
        ({ tr }) => {
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
        },
    }
  },
})
