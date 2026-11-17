import { Extension, type Editor } from '@tiptap/core'
import type { Mark, Node as ProseMirrorNode } from '@tiptap/pm/model'
import {
  Plugin,
  PluginKey,
  type EditorState,
  type Transaction,
} from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { getChangedRanges } from './changedRanges'
import './textEmphasis.css'

/** Emphasis a text style can give a whole block, which the text can then turn off. */
export const EMPHASES = ['bold', 'italic', 'underline', 'strike'] as const
export type Emphasis = (typeof EMPHASES)[number]

/** A block's emphasis from its text style (e.g. every Heading 2 bold); null for blocks without a style. */
export type GetBlockEmphasis = (
  block: ProseMirrorNode,
) => Record<Emphasis, boolean> | null

type TextEmphasisStorage = { getBlockEmphasis: GetBlockEmphasis }

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textEmphasis: {
      /**
       * Bold, italic, underline or strikethrough on or off for the selection
       * (or the text about to be typed), as it's shown: text its style makes
       * bold turns plain, plain text turns bold.
       */
      toggleEmphasis: (emphasis: Emphasis) => ReturnType
      /** Sets where blocks get emphasis from their text style, and redraws their lines to match. */
      setBlockEmphasis: (getBlockEmphasis: GetBlockEmphasis) => ReturnType
    }
  }
  interface Storage {
    textEmphasis: TextEmphasisStorage
  }
}

/** The text style mark's attribute turning a style's emphasis off for that text. */
export const EMPHASIS_OFF_ATTRIBUTES = {
  bold: 'noBold',
  italic: 'noItalic',
  underline: 'noUnderline',
  strike: 'noStrike',
} as const satisfies Record<Emphasis, string>

/** Classes drawing a style's lines on its text (see textEmphasis.css). */
const STYLE_LINE_CLASSES = {
  underline: 'style-underline',
  strike: 'style-strike',
} as const

const toDataAttribute = (attribute: string) =>
  `data-${attribute.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`

/** The data attributes that carry the offs in copied HTML, e.g. `data-no-bold`. */
export const EMPHASIS_OFF_DATA_ATTRIBUTES = Object.values(
  EMPHASIS_OFF_ATTRIBUTES,
).map(toDataAttribute)

const isOff = (marks: readonly Mark[], emphasis: Emphasis) =>
  marks.some(
    ({ type, attrs }) =>
      type.name === 'textStyle' &&
      attrs[EMPHASIS_OFF_ATTRIBUTES[emphasis]] === true,
  )

const linesKey = new PluginKey<DecorationSet>('textEmphasisLines')

/**
 * A style's underline and strikethrough, drawn on its text rather than on the
 * block: lines a block draws reach all its text, so text couldn't turn them off.
 */
function buildBlockLines(
  block: ProseMirrorNode,
  position: number,
  getBlockEmphasis: GetBlockEmphasis,
): Decoration[] {
  const blockEmphasis = getBlockEmphasis(block)
  if (!blockEmphasis?.underline && !blockEmphasis?.strike) return []
  const decorations: Decoration[] = []
  block.forEach((child, offset) => {
    if (!child.isText) return
    const classes = (['underline', 'strike'] as const)
      .filter((line) => blockEmphasis[line] && !isOff(child.marks, line))
      .map((line) => STYLE_LINE_CLASSES[line])
    if (classes.length === 0) return
    const from = position + 1 + offset
    decorations.push(
      Decoration.inline(from, from + child.nodeSize, {
        class: classes.join(' '),
      }),
    )
  })
  return decorations
}

function buildLines(
  doc: ProseMirrorNode,
  getBlockEmphasis: GetBlockEmphasis,
): DecorationSet {
  const decorations: Decoration[] = []
  doc.descendants((node, position) => {
    if (!node.isTextblock) return true
    decorations.push(...buildBlockLines(node, position, getBlockEmphasis))
    return false
  })
  return DecorationSet.create(doc, decorations)
}

/** Keeps the lines in step with an edit, reading again only the blocks it touched (as text case does). */
function updateLines(
  transaction: Transaction,
  decorations: DecorationSet,
  getBlockEmphasis: GetBlockEmphasis,
): DecorationSet {
  const { doc } = transaction
  let updated = decorations.map(transaction.mapping, doc)
  for (const [from, to] of getChangedRanges(transaction)) {
    doc.nodesBetween(from, to, (node, position) => {
      if (!node.isTextblock) return true
      updated = updated
        .remove(updated.find(position, position + node.nodeSize))
        .add(doc, buildBlockLines(node, position, getBlockEmphasis))
      return false
    })
  }
  return updated
}

/** Whether the selection's block has this emphasis from its text style. */
function isInBlockStyle(
  state: EditorState,
  emphasis: Emphasis,
  getBlockEmphasis: GetBlockEmphasis,
): boolean {
  return getBlockEmphasis(state.selection.$from.parent)?.[emphasis] ?? false
}

/**
 * Whether the selection (or the text about to be typed) shows this emphasis:
 * its own, or its style's unless turned off. What the toolbar shows as pressed.
 */
export function isEmphasisShown(editor: Editor, emphasis: Emphasis): boolean {
  if (editor.isActive(emphasis)) return true
  const { getBlockEmphasis } = editor.storage.textEmphasis
  return (
    isInBlockStyle(editor.state, emphasis, getBlockEmphasis) &&
    editor.getAttributes('textStyle')[EMPHASIS_OFF_ATTRIBUTES[emphasis]] !==
      true
  )
}

/**
 * Lets text turn off the bold, italic, underline or strikethrough its text
 * style gives it (stored on the text style mark, like its color), so the
 * toolbar's toggles and their shortcuts act on what's shown. Text's own
 * emphasis marks and its offs never overlap: turning one on removes the other.
 */
export const TextEmphasis = Extension.create<object, TextEmphasisStorage>({
  name: 'textEmphasis',

  // Before the marks' own shortcuts, so ⌘B and the rest toggle what's shown.
  priority: 200,

  addStorage() {
    return { getBlockEmphasis: () => null }
  },

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: Object.fromEntries(
          Object.values(EMPHASIS_OFF_ATTRIBUTES).map((attribute) => {
            const dataAttribute = toDataAttribute(attribute)
            return [
              attribute,
              {
                default: null,
                parseHTML: (element: HTMLElement) =>
                  element.hasAttribute(dataAttribute) ? true : null,
                renderHTML: (attributes: Record<string, unknown>) =>
                  attributes[attribute] === true ? { [dataAttribute]: '' } : {},
              },
            ]
          }),
        ),
      },
    ]
  },

  addCommands() {
    return {
      toggleEmphasis:
        (emphasis) =>
        ({ editor, state, chain }) => {
          const offAttribute = EMPHASIS_OFF_ATTRIBUTES[emphasis]
          const isInStyle = isInBlockStyle(
            state,
            emphasis,
            this.storage.getBlockEmphasis,
          )
          if (isEmphasisShown(editor, emphasis)) {
            const turnOff = chain().unsetMark(emphasis)
            return (
              isInStyle
                ? turnOff.setMark('textStyle', { [offAttribute]: true })
                : turnOff
            ).run()
          }
          const turnOn = chain()
            .setMark('textStyle', { [offAttribute]: null })
            .removeEmptyTextStyle()
          return (isInStyle ? turnOn : turnOn.setMark(emphasis)).run()
        },
      setBlockEmphasis:
        (getBlockEmphasis) =>
        ({ tr }) => {
          this.storage.getBlockEmphasis = getBlockEmphasis
          // Not an edit: nothing to undo, only the lines to redraw.
          tr.setMeta(linesKey, true).setMeta('addToHistory', false)
          return true
        },
    }
  },

  addKeyboardShortcuts() {
    const toggle = (emphasis: Emphasis) => () =>
      this.editor.schema.marks[emphasis]
        ? this.editor.commands.toggleEmphasis(emphasis)
        : false
    return {
      'Mod-b': toggle('bold'),
      'Mod-B': toggle('bold'),
      'Mod-i': toggle('italic'),
      'Mod-I': toggle('italic'),
      'Mod-u': toggle('underline'),
      'Mod-U': toggle('underline'),
      'Mod-Shift-x': toggle('strike'),
    }
  },

  addProseMirrorPlugins() {
    const { storage } = this
    // Read at use, so a later setBlockEmphasis applies.
    const getBlockEmphasis: GetBlockEmphasis = (block) =>
      storage.getBlockEmphasis(block)
    return [
      new Plugin({
        key: linesKey,
        state: {
          init: (_, { doc }) => buildLines(doc, getBlockEmphasis),
          apply: (transaction, decorations) => {
            if (transaction.getMeta(linesKey))
              return buildLines(transaction.doc, getBlockEmphasis)
            return transaction.docChanged
              ? updateLines(transaction, decorations, getBlockEmphasis)
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
