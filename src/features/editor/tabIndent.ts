import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

type TabIndentStorage = {
  /** Set by Escape: the next Tab leaves the editor instead of inserting a tab. */
  isLeavingEditor: boolean
}

/** Id of the hidden hint that tells keyboard users how to leave the editor. */
export const KEYBOARD_HINT_ID = 'journal-editor-keyboard-hint'

const TAB = '\t'

/**
 * Tab inserts a tab and Shift+Tab removes one from the start of the line.
 * Lists keep their own Tab handling (indent/outdent items), which runs first.
 * So keyboard users aren't trapped, Escape then Tab moves focus on as usual.
 */
export const TabIndent = Extension.create<object, TabIndentStorage>({
  name: 'tabIndent',
  // Below the default (100) so list items get first say over Tab.
  priority: 50,

  addStorage() {
    return { isLeavingEditor: false }
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (this.storage.isLeavingEditor) return false
        return this.editor.commands.command(({ tr }) => {
          tr.insertText(TAB)
          return true
        })
      },
      'Shift-Tab': () => {
        if (this.storage.isLeavingEditor) return false
        return this.editor.commands.command(({ tr, state }) => {
          const { $from } = state.selection
          if ($from.parent.textContent.startsWith(TAB)) {
            const lineStart = $from.start()
            tr.delete(lineStart, lineStart + TAB.length)
          }
          // Handled even when there's nothing to remove, so focus doesn't jump away.
          return true
        })
      },
      Escape: () => {
        this.storage.isLeavingEditor = true
        return false
      },
    }
  },

  onBlur() {
    this.storage.isLeavingEditor = false
  },

  addProseMirrorPlugins() {
    const { storage } = this
    return [
      new Plugin({
        key: new PluginKey('tabIndentReset'),
        props: {
          // Any other key cancels a pending Escape-then-Tab.
          handleKeyDown(_view, { key }) {
            if (key !== 'Escape' && key !== 'Tab' && key !== 'Shift')
              storage.isLeavingEditor = false
            return false
          },
        },
      }),
    ]
  },
})
