import { Mark } from '@tiptap/core'
import type { MarkType, Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey, type Transaction } from '@tiptap/pm/state'
import { AddMarkStep, RemoveMarkStep } from '@tiptap/pm/transform'
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

/** The cases that capitalize some letters, which CSS can't do. */
const CAPITALIZING_CASES = ['title', 'sentence'] as const

function hasCapitalizingCase(block: ProseMirrorNode, markType: MarkType) {
  let hasCase = false
  block.forEach((child) => {
    const textCase = markType.isInSet(child.marks)?.attrs.textCase
    if (CAPITALIZING_CASES.includes(textCase)) hasCase = true
  })
  return hasCase
}

/** Capitals in the text block at `position`; none (and no work) for most blocks. */
function buildBlockCapitals(
  block: ProseMirrorNode,
  position: number,
  markType: MarkType,
): Decoration[] {
  if (!hasCapitalizingCase(block, markType)) return []
  const decorations: Decoration[] = []
  const { text, casesByOffset } = readBlock(block, markType)
  for (const textCase of CAPITALIZING_CASES) {
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
  return decorations
}

function buildCapitalDecorations(
  doc: ProseMirrorNode,
  markType: MarkType,
): DecorationSet {
  const decorations: Decoration[] = []
  doc.descendants((node, position) => {
    if (!node.isTextblock) return true
    decorations.push(...buildBlockCapitals(node, position, markType))
    return false
  })
  return DecorationSet.create(doc, decorations)
}

/** Where a transaction changed the document (text, or marks), in the new document. */
function getChangedRanges(transaction: Transaction): [number, number][] {
  const ranges: [number, number][] = []
  transaction.steps.forEach((step, index) => {
    const laterMapping = transaction.mapping.slice(index + 1)
    const addRange = (from: number, to: number) =>
      ranges.push([laterMapping.map(from, -1), laterMapping.map(to, 1)])
    step.getMap().forEach((_oldFrom, _oldTo, from, to) => addRange(from, to))
    // Mark changes move nothing, so their map is empty.
    if (step instanceof AddMarkStep || step instanceof RemoveMarkStep)
      addRange(step.from, step.to)
  })
  return ranges
}

/**
 * Keeps the capitals in step with an edit: the rest move with the text, and
 * only the blocks it touched are read again, so typing costs the same however
 * long the entry is.
 */
function updateCapitalDecorations(
  transaction: Transaction,
  decorations: DecorationSet,
  markType: MarkType,
): DecorationSet {
  const { doc } = transaction
  let updated = decorations.map(transaction.mapping, doc)
  for (const [from, to] of getChangedRanges(transaction)) {
    doc.nodesBetween(from, to, (node, position) => {
      if (!node.isTextblock) return true
      updated = updated
        .remove(updated.find(position, position + node.nodeSize))
        .add(doc, buildBlockCapitals(node, position, markType))
      return false
    })
  }
  return updated
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
              ? updateCapitalDecorations(transaction, decorations, markType)
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
