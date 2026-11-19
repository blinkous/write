import { TEXT_STYLE_LABELS, type TextStyleName } from '../../text-styles'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { ChainedCommands, Editor } from '@tiptap/react'
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Captions,
  Type,
  type LucideIcon,
} from 'lucide-react'
import type { ContentHeadingLevel, ParagraphSize } from '../../journal-document'
import type { ShortcutCommandId } from '../../keyboard-shortcuts'

/** What a style is in the document: a heading level, or a paragraph (body or a size). */
type TextStyleBlock =
  | { kind: 'heading'; level: ContentHeadingLevel }
  | { kind: 'paragraph'; size: ParagraphSize | null }

export type TextStyle = {
  /** Also its key in settings (text-styles), which define how it looks. */
  name: Exclude<TextStyleName, 'title'>
  label: string
  /** Shown in the toolbar for the current style, and beside the label in the menu. */
  icon: LucideIcon
  block: TextStyleBlock
  /** Its keyboard shortcut (changeable in settings), shown in the menu. */
  shortcutId?: ShortcutCommandId
}

/**
 * Paragraph styles, smallest to largest; ⇧⌘> / ⇧⌘< step through them in this
 * order. Heading 1 is the entry's title, so content headings start at 2.
 */
export const TEXT_STYLES: readonly TextStyle[] = [
  {
    name: 'small',
    label: TEXT_STYLE_LABELS['small'],
    icon: Captions,
    block: { kind: 'paragraph', size: 'small' },
  },
  {
    name: 'body',
    label: TEXT_STYLE_LABELS['body'],
    icon: Type,
    block: { kind: 'paragraph', size: null },
    shortcutId: 'text-style-body',
  },
  {
    name: 'heading-6',
    label: TEXT_STYLE_LABELS['heading-6'],
    icon: Heading6,
    block: { kind: 'heading', level: 6 },
    shortcutId: 'text-style-heading-6',
  },
  {
    name: 'heading-5',
    label: TEXT_STYLE_LABELS['heading-5'],
    icon: Heading5,
    block: { kind: 'heading', level: 5 },
    shortcutId: 'text-style-heading-5',
  },
  {
    name: 'heading-4',
    label: TEXT_STYLE_LABELS['heading-4'],
    icon: Heading4,
    block: { kind: 'heading', level: 4 },
    shortcutId: 'text-style-heading-4',
  },
  {
    name: 'heading-3',
    label: TEXT_STYLE_LABELS['heading-3'],
    icon: Heading3,
    block: { kind: 'heading', level: 3 },
    shortcutId: 'text-style-heading-3',
  },
  {
    name: 'heading-2',
    label: TEXT_STYLE_LABELS['heading-2'],
    icon: Heading2,
    block: { kind: 'heading', level: 2 },
    shortcutId: 'text-style-heading-2',
  },
]

/**
 * The title editor's one style: all of its text, so it's never applied or
 * stepped to, only shown and edited.
 */
export const TITLE_STYLE = {
  name: 'title',
  label: TEXT_STYLE_LABELS['title'],
  icon: Heading1,
} as const satisfies Pick<TextStyle, 'label' | 'icon'> & { name: TextStyleName }

/** The everyday style: plain paragraphs. */
export const BODY_STYLE =
  TEXT_STYLES.find(({ name }) => name === 'body') ?? TEXT_STYLES[0]

function isActive(editor: Editor, block: TextStyleBlock): boolean {
  if (block.kind === 'heading')
    return editor.isActive('heading', { level: block.level })
  return (
    editor.isActive('paragraph') &&
    (editor.getAttributes('paragraph').size ?? null) === block.size
  )
}

/** The style of the paragraph at the cursor (body for anything not listed, e.g. a list item's text). */
export function getActiveTextStyle(editor: Editor): TextStyle {
  return TEXT_STYLES.find(({ block }) => isActive(editor, block)) ?? BODY_STYLE
}

function isBlockOfStyle(node: ProseMirrorNode, block: TextStyleBlock): boolean {
  if (block.kind === 'heading')
    return node.type.name === 'heading' && node.attrs.level === block.level
  return (
    node.type.name === 'paragraph' && (node.attrs.size ?? null) === block.size
  )
}

/** A writing block's text style, by its settings name; null for blocks without one (code blocks). */
export function getBlockTextStyleName(
  node: ProseMirrorNode,
): TextStyleName | null {
  return (
    TEXT_STYLES.find(({ block }) => isBlockOfStyle(node, block))?.name ?? null
  )
}

/**
 * The text style at the cursor, by its settings name: the title editor's text
 * is all Title; the writing's follows its paragraph (see getActiveTextStyle).
 */
export function getTextStyleNameAt(
  editor: Editor,
  isTitle: boolean,
): TextStyleName {
  return isTitle ? 'title' : getActiveTextStyle(editor).name
}

/** Adds giving the selection's blocks this style to a chain of commands. */
export function chainTextStyle(
  chain: ChainedCommands,
  { block }: TextStyle,
): ChainedCommands {
  if (block.kind === 'heading') return chain.setHeading({ level: block.level })
  return chain
    .setParagraph()
    .updateAttributes('paragraph', { size: block.size })
}

export function applyTextStyle(editor: Editor, textStyle: TextStyle): boolean {
  return chainTextStyle(editor.chain().focus(), textStyle).run()
}

/** Moves the current paragraph one style larger (1) or smaller (-1); stops at the ends. */
export function stepTextStyle(editor: Editor, direction: 1 | -1): boolean {
  const currentIndex = TEXT_STYLES.indexOf(getActiveTextStyle(editor))
  const nextStyle = TEXT_STYLES[currentIndex + direction]
  // Handled even at the ends, so the shortcut never falls through to the browser.
  return nextStyle ? applyTextStyle(editor, nextStyle) : true
}
