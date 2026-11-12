import { Extension } from '@tiptap/core'

/** Paragraph sizes beyond body text. Headings are their own node type. */
export const PARAGRAPH_SIZES = ['small'] as const
export type ParagraphSize = (typeof PARAGRAPH_SIZES)[number]

export function isParagraphSize(value: unknown): value is ParagraphSize {
  return PARAGRAPH_SIZES.some((size) => size === value)
}

/** Data attribute the editor styles; a class-free attribute keeps the CSP strict (no inline style). */
export const PARAGRAPH_SIZE_ATTRIBUTE = 'data-size'

/**
 * Lets a paragraph be "small" (smaller than body text). Markdown has no small
 * text, so it copies as a plain paragraph. Enter after a small paragraph starts
 * a body one, as after a heading.
 */
export const ParagraphSize = Extension.create({
  name: 'paragraphSize',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          size: {
            default: null,
            keepOnSplit: false,
            parseHTML: (element) => {
              const size = element.getAttribute(PARAGRAPH_SIZE_ATTRIBUTE)
              return isParagraphSize(size) ? size : null
            },
            renderHTML: ({ size }) =>
              isParagraphSize(size) ? { [PARAGRAPH_SIZE_ATTRIBUTE]: size } : {},
          },
        },
      },
    ]
  },
})
