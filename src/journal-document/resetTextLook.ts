import { Extension } from '@tiptap/core'
import { EMPHASES } from './textEmphasis'

/** The marks that give text a look of its own; links and code stay. */
const OWN_LOOK_MARKS = ['textStyle', 'textCase', ...EMPHASES] as const

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resetTextLook: {
      /**
       * Removes the selected text's own look (font, color, glow, case, letter
       * spacing, emphasis), so it looks like its text style; without a
       * selection, the cursor's whole block.
       */
      resetTextLook: () => ReturnType
    }
  }
}

/** Text back to its text style's look, on ⌘\\ as in Docs. */
export const ResetTextLook = Extension.create({
  name: 'resetTextLook',

  addCommands() {
    return {
      resetTextLook:
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

  addKeyboardShortcuts() {
    return { 'Mod-\\': () => this.editor.commands.resetTextLook() }
  },
})
