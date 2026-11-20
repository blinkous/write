import { Extension } from '@tiptap/core'
import type { Transaction } from '@tiptap/pm/state'

/** Start and end rather than left and right, so they follow the writing's direction. */
export const TEXT_ALIGNMENTS = ['start', 'center', 'end'] as const
export type TextAlignment = (typeof TEXT_ALIGNMENTS)[number]

export function isTextAlignment(value: unknown): value is TextAlignment {
  return TEXT_ALIGNMENTS.some((alignment) => alignment === value)
}

/** Data attribute the page styles (no inline style, which the CSP blocks). */
export const ALIGNMENT_ATTRIBUTE = 'data-align'

/** The blocks that line up: text blocks and pictures. */
export const ALIGNABLE_NODE_NAMES = ['paragraph', 'heading', 'image'] as const

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textAlignment: {
      /** Lines up the selected blocks (or the cursor's) this way, as their own. */
      setTextAlignment: (alignment: TextAlignment) => ReturnType
      /** The selected blocks follow their text style's alignment again. */
      unsetTextAlignment: () => ReturnType
    }
  }
}

/** Sets (or, with null, removes) the own alignment of every alignable block in the selection. */
export function setBlockAlignment(
  tr: Transaction,
  alignment: TextAlignment | null,
  [from, to]: [number, number] = [tr.selection.from, tr.selection.to],
): void {
  tr.doc.nodesBetween(from, to, (node, position) => {
    if (!ALIGNABLE_NODE_NAMES.some((name) => name === node.type.name))
      return true
    if ((node.attrs.alignment ?? null) !== alignment)
      tr.setNodeAttribute(position, 'alignment', alignment)
    return false
  })
}

/**
 * A block's own alignment (start, center or end), or none to follow its text
 * style. Pictures have no style; theirs follows Body's.
 */
export const TextAlignmentAttribute = Extension.create({
  name: 'textAlignment',

  addGlobalAttributes() {
    return [
      {
        types: [...ALIGNABLE_NODE_NAMES],
        attributes: {
          alignment: {
            default: null,
            parseHTML: (element) => {
              const alignment = element.getAttribute(ALIGNMENT_ATTRIBUTE)
              return isTextAlignment(alignment) ? alignment : null
            },
            renderHTML: ({ alignment }) =>
              isTextAlignment(alignment)
                ? { [ALIGNMENT_ATTRIBUTE]: alignment }
                : {},
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setTextAlignment:
        (alignment) =>
        ({ tr }) => {
          setBlockAlignment(tr, alignment)
          return true
        },
      unsetTextAlignment:
        () =>
        ({ tr }) => {
          setBlockAlignment(tr, null)
          return true
        },
    }
  },
})
