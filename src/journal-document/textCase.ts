import { Mark } from '@tiptap/core'
import type { MarkType, Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey, type Transaction } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import {
  AS_TYPED_CASE,
  findCapitalOffsets,
  isOwnTextCase,
  isTextCase,
  type OwnTextCase,
  type TextCase,
} from './capitalization'
import { getChangedRanges } from './changedRanges'

/** Class on letters shown as capitals inside title/sentence case; styled by the editor. */
export const CAPITAL_LETTER_CLASS = 'text-case-capital'

/** A block's own case, from its text style (e.g. every Heading 2 in title case); null when none. */
export type GetBlockTextCase = (block: ProseMirrorNode) => TextCase | null

type TextCaseStorage = { getBlockTextCase: GetBlockTextCase }

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textCase: {
      /** Displays the selection (or the text about to be typed) in a case, or as typed where its style has one. */
      setTextCase: (textCase: OwnTextCase) => ReturnType
      unsetTextCase: () => ReturnType
      /** Sets where blocks get a case from their text style, and redraws the capitals to match. */
      setBlockTextCases: (getBlockTextCase: GetBlockTextCase) => ReturnType
    }
  }
  interface Storage {
    textCase: TextCaseStorage
  }
}

const capitalsKey = new PluginKey<DecorationSet>('textCaseCapitals')

/** Text in a block, with the case applied to each position: the text's own, else the block's (null when neither). */
function readBlock(
  block: ProseMirrorNode,
  markType: MarkType,
  blockCase: TextCase | null,
) {
  let text = ''
  const casesByOffset: (TextCase | null)[] = []
  block.forEach((child) => {
    // Non-text inline nodes (e.g. line breaks) count as whitespace of their size.
    const childText = child.isText
      ? (child.text ?? '')
      : ' '.repeat(child.nodeSize)
    const textCase = markType.isInSet(child.marks)?.attrs.textCase
    // Code keeps its letters as typed (it takes no other marks, so only a block's case reaches it).
    const isCode = child.marks.some(({ type }) => type.name === 'code')
    text += childText
    casesByOffset.push(
      ...Array<TextCase | null>(childText.length).fill(
        // As typed wins over its block's case, showing no capitals.
        textCase === AS_TYPED_CASE
          ? null
          : isTextCase(textCase)
            ? textCase
            : isCode
              ? null
              : blockCase,
      ),
    )
  })
  return { text, casesByOffset }
}

/** The cases that capitalize some letters, which CSS can't do. */
const CAPITALIZING_CASES = ['title', 'sentence'] as const

const isCapitalizingCase = (textCase: unknown) =>
  CAPITALIZING_CASES.some((capitalizingCase) => capitalizingCase === textCase)

function hasCapitalizingCase(
  block: ProseMirrorNode,
  markType: MarkType,
  blockCase: TextCase | null,
) {
  let hasCase = isCapitalizingCase(blockCase)
  block.forEach((child) => {
    const textCase = markType.isInSet(child.marks)?.attrs.textCase
    if (isCapitalizingCase(textCase)) hasCase = true
  })
  return hasCase
}

/** Capitals in the text block at `position`; none (and no work) for most blocks. */
function buildBlockCapitals(
  block: ProseMirrorNode,
  position: number,
  markType: MarkType,
  getBlockTextCase: GetBlockTextCase,
): Decoration[] {
  const blockCase = getBlockTextCase(block)
  if (!hasCapitalizingCase(block, markType, blockCase)) return []
  const decorations: Decoration[] = []
  const { text, casesByOffset } = readBlock(block, markType, blockCase)
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
  getBlockTextCase: GetBlockTextCase,
): DecorationSet {
  const decorations: Decoration[] = []
  doc.descendants((node, position) => {
    if (!node.isTextblock) return true
    decorations.push(
      ...buildBlockCapitals(node, position, markType, getBlockTextCase),
    )
    return false
  })
  return DecorationSet.create(doc, decorations)
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
  getBlockTextCase: GetBlockTextCase,
): DecorationSet {
  const { doc } = transaction
  let updated = decorations.map(transaction.mapping, doc)
  for (const [from, to] of getChangedRanges(transaction)) {
    doc.nodesBetween(from, to, (node, position) => {
      if (!node.isTextblock) return true
      updated = updated
        .remove(updated.find(position, position + node.nodeSize))
        .add(
          doc,
          buildBlockCapitals(node, position, markType, getBlockTextCase),
        )
      return false
    })
  }
  return updated
}

/**
 * Changes how text is displayed (UPPER, lower, Title, Sentence) without
 * changing the letters typed. Like bold, typing inside it continues the case.
 * Blocks can also get a case from their text style (`setBlockTextCases`);
 * the text's own case wins.
 */
export const TextCaseMark = Mark.create<object, TextCaseStorage>({
  name: 'textCase',

  addStorage() {
    return { getBlockTextCase: () => null }
  },

  addAttributes() {
    return {
      textCase: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-text-case'),
        renderHTML: ({ textCase }) =>
          isOwnTextCase(textCase) ? { 'data-text-case': textCase } : {},
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
      setBlockTextCases:
        (getBlockTextCase) =>
        ({ tr }) => {
          this.storage.getBlockTextCase = getBlockTextCase
          // Not an edit: nothing to undo, only the capitals to redraw.
          tr.setMeta(capitalsKey, true).setMeta('addToHistory', false)
          return true
        },
    }
  },

  /* CSS can't do title or sentence case, so capitals are marked with decorations. */
  addProseMirrorPlugins() {
    const markType = this.type
    const { storage } = this
    // Read at use, so a later setBlockTextCases applies.
    const getBlockTextCase: GetBlockTextCase = (block) =>
      storage.getBlockTextCase(block)
    return [
      new Plugin({
        key: capitalsKey,
        state: {
          init: (_, { doc }) =>
            buildCapitalDecorations(doc, markType, getBlockTextCase),
          apply: (transaction, decorations) => {
            if (transaction.getMeta(capitalsKey))
              return buildCapitalDecorations(
                transaction.doc,
                markType,
                getBlockTextCase,
              )
            return transaction.docChanged
              ? updateCapitalDecorations(
                  transaction,
                  decorations,
                  markType,
                  getBlockTextCase,
                )
              : decorations
          },
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
