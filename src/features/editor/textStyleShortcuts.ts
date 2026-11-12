import { Extension } from '@tiptap/core'
import { applyTextStyle, stepTextStyle, TEXT_STYLES } from './textStyles'

/**
 * ⇧⌘> / ⇧⌘< make the current paragraph one style larger / smaller, like
 * resizing in Word or Docs, and each style's own shortcut (e.g. ⌥⌘2) applies
 * it. These replace Tiptap's heading and paragraph shortcuts (later extensions
 * win), so Body also resets Small.
 */
export const TextStyleShortcuts = Extension.create({
  name: 'textStyleShortcuts',

  addKeyboardShortcuts() {
    const styleShortcuts = Object.fromEntries(
      TEXT_STYLES.flatMap((textStyle) =>
        textStyle.shortcut
          ? [[textStyle.shortcut, () => applyTextStyle(this.editor, textStyle)]]
          : [],
      ),
    )
    return {
      ...styleShortcuts,
      'Mod-Shift-.': () => stepTextStyle(this.editor, 1),
      'Mod-Shift-,': () => stepTextStyle(this.editor, -1),
    }
  },
})
