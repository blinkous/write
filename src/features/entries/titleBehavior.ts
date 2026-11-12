import { Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'

type TitleBehaviorOptions = {
  maxLength: number
}

type TitleBehaviorStorage = {
  /** Moves on into the writing: Enter, or ↓ at the end of the title. Set by the app. */
  onContinue: () => void
}

declare module '@tiptap/core' {
  interface Storage {
    titleBehavior: TitleBehaviorStorage
  }
  interface Commands<ReturnType> {
    titleBehavior: {
      /** Sets what Enter / ↓ at the end of the title do (move on into the writing). */
      setContinueHandler: (onContinue: () => void) => ReturnType
    }
  }
}

/** Keeps the title one line of limited length, and lets Enter / ↓ move on to the writing. */
export const TitleBehavior = Extension.create<
  TitleBehaviorOptions,
  TitleBehaviorStorage
>({
  name: 'titleBehavior',

  addOptions() {
    return { maxLength: Infinity }
  },

  addStorage() {
    return { onContinue: () => {} }
  },

  addCommands() {
    return {
      setContinueHandler: (onContinue) => () => {
        this.storage.onContinue = onContinue
        return true
      },
    }
  },

  addKeyboardShortcuts() {
    const continueToWriting = () => {
      this.storage.onContinue()
      return true
    }
    return {
      Enter: continueToWriting,
      'Shift-Enter': continueToWriting,
      ArrowDown: ({ editor }) => {
        const { empty, to } = editor.state.selection
        const isAtEnd = to === editor.state.doc.content.size - 1
        return empty && isAtEnd && continueToWriting()
      },
    }
  },

  addProseMirrorPlugins() {
    const { maxLength } = this.options
    return [
      new Plugin({
        props: {
          // A title is one line: pasted line breaks become spaces (as plain text).
          handlePaste: (view, event) => {
            const pastedText = event.clipboardData?.getData('text/plain')
            if (!pastedText) return false
            view.dispatch(
              view.state.tr.insertText(pastedText.replace(/\s*\n\s*/g, ' ')),
            )
            return true
          },
        },
        filterTransaction: (transaction) =>
          !transaction.docChanged ||
          transaction.doc.textContent.length <= maxLength,
      }),
    ]
  },
})
