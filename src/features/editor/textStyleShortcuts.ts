import { Extension } from '@tiptap/core'
import { stepTextStyle } from './textStyles'

/** ⌘⇧> / ⌘⇧< make the current paragraph one style larger / smaller, like resizing in Word or Docs. */
export const TextStyleShortcuts = Extension.create({
  name: 'textStyleShortcuts',

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-.': () => stepTextStyle(this.editor, 1),
      'Mod-Shift-,': () => stepTextStyle(this.editor, -1),
    }
  },
})
