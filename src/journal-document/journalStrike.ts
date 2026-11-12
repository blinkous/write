import Strike from '@tiptap/extension-strike'

/**
 * Strikethrough on ⇧⌘X (as in Google Docs) instead of Tiptap's ⇧⌘S, which is
 * the app's "save all entries"; `~~text~~` works too.
 */
export const JournalStrike = Strike.extend({
  addKeyboardShortcuts() {
    return { 'Mod-Shift-x': () => this.editor.commands.toggleStrike() }
  },
})
