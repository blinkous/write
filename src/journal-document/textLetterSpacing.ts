import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textLetterSpacing: {
      /** Gives the selected text (or text about to be typed) its own letter spacing, in % of its size. */
      setTextLetterSpacing: (letterSpacing: number) => ReturnType
      /** Removes the text's own letter spacing, so it follows its text style's. */
      unsetTextLetterSpacing: () => ReturnType
    }
  }
}

/** Letter spacing as a percent of the text's size (so it scales with it), stepped by 1. */
export const LETTER_SPACING_RANGE = { min: -5, max: 30 } as const

export function isLetterSpacing(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= LETTER_SPACING_RANGE.min &&
    value <= LETTER_SPACING_RANGE.max
  )
}

/** The CSS letter-spacing (em) for a stored percent, or null if it isn't one in range. */
export function resolveTextLetterSpacing(stored: unknown): string | null {
  return isLetterSpacing(stored) ? `${stored / 100}em` : null
}

/**
 * Per-text letter spacing, stored on the text style mark (like color and
 * font) as a whole percent in range, so documents can't carry arbitrary CSS.
 * Text without it follows its text style's.
 */
export const TextLetterSpacing = Extension.create({
  name: 'textLetterSpacing',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          letterSpacing: {
            default: null,
            parseHTML: (element) => {
              const letterSpacing = Number(
                element.getAttribute('data-letter-spacing'),
              )
              return isLetterSpacing(letterSpacing) ? letterSpacing : null
            },
            renderHTML: ({ letterSpacing }) =>
              isLetterSpacing(letterSpacing)
                ? { 'data-letter-spacing': String(letterSpacing) }
                : {},
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setTextLetterSpacing:
        (letterSpacing) =>
        ({ chain }) =>
          chain().setMark('textStyle', { letterSpacing }).run(),
      unsetTextLetterSpacing:
        () =>
        ({ chain }) =>
          chain()
            .setMark('textStyle', { letterSpacing: null })
            .removeEmptyTextStyle()
            .run(),
    }
  },
})
