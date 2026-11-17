import type { Editor } from '@tiptap/react'
import { isEmphasisShown } from '../../journal-document'
import {
  Bold,
  Code,
  Italic,
  List,
  ListOrdered,
  Quote,
  SquareCode,
  Strikethrough,
  Underline,
  type LucideIcon,
} from 'lucide-react'

export type FormattingAction = {
  name: string
  label: string
  /** Tiptap's keyboard shortcut for it (e.g. "Mod-b"), shown with the label. */
  shortcut: string
  /** Visible icon; `label` is the accessible name. */
  icon: LucideIcon
  /** The node or mark this needs; the button is off in editors without it (e.g. the title). */
  requires: string
  isActive: (editor: Editor) => boolean
  run: (editor: Editor) => void
}

/*
 * Every styling shortcut the editors support has a button here (or, for
 * headings, a row in TextStyleMenu), so nothing is reachable only by keyboard.
 * Markdown shortcuts (`- `, `> `, `**bold**`, `~~strike~~`) also work while typing.
 */

/**
 * Emphasis on the text itself, between color and glow in the toolbar. Each
 * shows and toggles what's shown, its text style's included (see journal-document's textEmphasis).
 */
export const TEXT_FORMATTING_ACTIONS: readonly FormattingAction[] = [
  {
    name: 'bold',
    label: 'Bold',
    shortcut: 'Mod-b',
    icon: Bold,
    requires: 'bold',
    isActive: (editor) => isEmphasisShown(editor, 'bold'),
    run: (editor) => editor.chain().focus().toggleEmphasis('bold').run(),
  },
  {
    name: 'italic',
    label: 'Italic',
    shortcut: 'Mod-i',
    icon: Italic,
    requires: 'italic',
    isActive: (editor) => isEmphasisShown(editor, 'italic'),
    run: (editor) => editor.chain().focus().toggleEmphasis('italic').run(),
  },
  {
    name: 'underline',
    label: 'Underline',
    shortcut: 'Mod-u',
    icon: Underline,
    requires: 'underline',
    isActive: (editor) => isEmphasisShown(editor, 'underline'),
    run: (editor) => editor.chain().focus().toggleEmphasis('underline').run(),
  },
  {
    name: 'strike',
    label: 'Strikethrough',
    shortcut: 'Mod-Shift-x',
    icon: Strikethrough,
    requires: 'strike',
    isActive: (editor) => isEmphasisShown(editor, 'strike'),
    run: (editor) => editor.chain().focus().toggleEmphasis('strike').run(),
  },
]

/** Markup: lists, quotes and code (inline beside blocks, since both mean "this is code"). */
export const MARKUP_FORMATTING_ACTIONS: readonly FormattingAction[] = [
  {
    name: 'bullet-list',
    label: 'Bulleted list',
    shortcut: 'Mod-Shift-8',
    icon: List,
    requires: 'bulletList',
    isActive: (editor) => editor.isActive('bulletList'),
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    name: 'ordered-list',
    label: 'Numbered list',
    shortcut: 'Mod-Shift-7',
    icon: ListOrdered,
    requires: 'orderedList',
    isActive: (editor) => editor.isActive('orderedList'),
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    name: 'blockquote',
    label: 'Quote',
    shortcut: 'Mod-Shift-b',
    icon: Quote,
    requires: 'blockquote',
    isActive: (editor) => editor.isActive('blockquote'),
    run: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    name: 'code',
    label: 'Code',
    shortcut: 'Mod-e',
    icon: Code,
    requires: 'code',
    isActive: (editor) => editor.isActive('code'),
    run: (editor) => editor.chain().focus().toggleCode().run(),
  },
  {
    name: 'code-block',
    label: 'Code block',
    shortcut: 'Mod-Alt-c',
    icon: SquareCode,
    requires: 'codeBlock',
    isActive: (editor) => editor.isActive('codeBlock'),
    run: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
]

/**
 * Whether the editor's schema has the node or mark (e.g. the title has no
 * lists). A destroyed editor (briefly passed down while another entry opens)
 * supports nothing.
 */
export function editorSupports(editor: Editor, name: string): boolean {
  if (editor.isDestroyed) return false
  const { nodes, marks } = editor.schema
  return name in nodes || name in marks
}
