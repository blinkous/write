import { Extension } from '@tiptap/core'
import { getFontOption, isFontValue, type FontValue } from '../fonts'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textFont: {
      /** Gives the selected text (or text about to be typed) its own font. */
      setTextFont: (font: FontValue) => ReturnType
      /** Removes the text's own font, so it follows the editor font. */
      unsetTextFont: () => ReturnType
    }
  }
}

/** The CSS font family for a stored text font, or null if it isn't one of the bundled fonts. */
export function resolveTextFont(storedFont: unknown): string | null {
  return isFontValue(storedFont) ? getFontOption(storedFont).family : null
}

/**
 * Per-text font, stored by name on the text style mark (like colors), so
 * documents can't carry arbitrary CSS. Text without one follows the editor font.
 */
export const TextFont = Extension.create({
  name: 'textFont',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          font: {
            default: null,
            parseHTML: (element) => {
              const font = element.getAttribute('data-font')
              return isFontValue(font) ? font : null
            },
            renderHTML: ({ font }) =>
              isFontValue(font) ? { 'data-font': font } : {},
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setTextFont:
        (font) =>
        ({ chain }) =>
          chain().setMark('textStyle', { font }).run(),
      unsetTextFont:
        () =>
        ({ chain }) =>
          chain()
            .setMark('textStyle', { font: null })
            .removeEmptyTextStyle()
            .run(),
    }
  },
})
