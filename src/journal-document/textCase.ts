import { Mark } from '@tiptap/core'
import type { MarkType, Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { findCapitalOffsets, isTextCase, type TextCase } from './capitalization'

/** Class on letters shown as capitals inside title/sentence case; styled by the editor. */
export const CAPITAL_LETTER_CLASS = 'text-case-capital'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textCase: {
      /** Displays the selection (or the text about to be typed) in a case. */
      setTextCase: (textCase: TextCase) => ReturnType
      unsetTextCase: () => ReturnType
    }
  }
}

/** Text in a block, with the case applied to each position (null when none). */
function readBlock(block: ProseMirrorNode, markType: MarkType) {
  let text = ''
  const casesByOffset: (TextCase | null)[] = []
  block.forEach((child) => {
    // Non-text inline nodes (e.g. line breaks) count as whitespace of their size.
    const childText = child.isText
      ? (child.text ?? '')
      : ' '.repeat(child.nodeSize)
    const textCase = markType.isInSet(child.marks)?.attrs.textCase
    text += childText
    casesByOffset.push(
      ...Array<TextCase | null>(childText.length).fill(
        isTextCase(textCase) ? textCase : null,
      ),
    )
  })
  return { text, casesByOffset }
}

function buildCapitalDecorations(
  doc: ProseMirrorNode,
  markType: MarkType,
): DecorationSet {
  const decorations: Decoration[] = []
  doc.descendants((node, position) => {
    if (!node.isTextblock) return true
    const { text, casesByOffset } = readBlock(node, markType)
    for (const textCase of ['title', 'sentence'] as const) {
      if (!casesByOffset.includes(textCase)) continue
      for (const offset of findCapitalOffsets(text, textCase)) {
        if (casesByOffset[offset] !== textCase) continue
        const from = position + 1 + offset
        // Some letters take two UTF-16 code units; cover the whole character.
        const letterLength = String.fromCodePoint(
          text.codePointAt(offset) ?? 0,
        ).length
        decorations.push(
          Decoration.inline(from, from + letterLength, {
            class: CAPITAL_LETTER_CLASS,
          }),
        )
      }
    }
    return false
  })
  return DecorationSet.create(doc, decorations)
}

/**
 * Changes how text is displayed (UPPER, lower, Title, Sentence) without
 * changing the letters typed. Like bold, typing inside it continues the case.
 */
export const TextCaseMark = Mark.create({
  name: 'textCase',

  addAttributes() {
    return {
      textCase: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-text-case'),
        renderHTML: ({ textCase }) =>
          isTextCase(textCase) ? { 'data-text-case': textCase } : {},
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-text-case]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0]
  },

  addCommands() {
    return {
      setTextCase:
        (textCase) =>
        ({ commands }) =>
          commands.setMark(this.name, { textCase }),
      unsetTextCase:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    }
  },

  /* CSS can't do title or sentence case, so capitals are marked with decorations. */
  addProseMirrorPlugins() {
    const markType = this.type
    return [
      new Plugin({
        key: new PluginKey('textCaseCapitals'),
        state: {
          init: (_, { doc }) => buildCapitalDecorations(doc, markType),
          apply: (transaction, decorations) =>
            transaction.docChanged
              ? buildCapitalDecorations(transaction.doc, markType)
              : decorations,
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },
})
