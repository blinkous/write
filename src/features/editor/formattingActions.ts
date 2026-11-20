import type { Editor } from '@tiptap/react'
import { isEmphasisShown } from '../../journal-document'
import type { ShortcutCommandId } from '../../keyboard-shortcuts'
import {
  Bold,
  Code,
  ImagePlus,
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
  /** Its keyboard shortcut (changeable in settings), shown with the label. */
  shortcutId: ShortcutCommandId
  /** Visible icon; `label` is the accessible name. */
  icon: LucideIcon
  /** The node or mark this needs; the button is off in editors without it (e.g. the title). */
  requires: string
  /** For a toggle, whether it's on (shown pressed); absent for a one-off action. */
  isActive?: (editor: Editor) => boolean
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
    shortcutId: 'bold',
    icon: Bold,
    requires: 'bold',
    isActive: (editor) => isEmphasisShown(editor, 'bold'),
    run: (editor) => editor.chain().focus().toggleEmphasis('bold').run(),
  },
  {
    name: 'italic',
    label: 'Italic',
    shortcutId: 'italic',
    icon: Italic,
    requires: 'italic',
    isActive: (editor) => isEmphasisShown(editor, 'italic'),
    run: (editor) => editor.chain().focus().toggleEmphasis('italic').run(),
  },
  {
    name: 'underline',
    label: 'Underline',
    shortcutId: 'underline',
    icon: Underline,
    requires: 'underline',
    isActive: (editor) => isEmphasisShown(editor, 'underline'),
    run: (editor) => editor.chain().focus().toggleEmphasis('underline').run(),
  },
  {
    name: 'strike',
    label: 'Strikethrough',
    shortcutId: 'strike',
    icon: Strikethrough,
    requires: 'strike',
    isActive: (editor) => isEmphasisShown(editor, 'strike'),
    run: (editor) => editor.chain().focus().toggleEmphasis('strike').run(),
  },
]

/** Markup: lists, quotes and code (inline beside blocks, since both mean "this is code"), then pictures. */
export const MARKUP_FORMATTING_ACTIONS: readonly FormattingAction[] = [
  {
    name: 'bullet-list',
    label: 'Bulleted list',
    shortcutId: 'bullet-list',
    icon: List,
    requires: 'bulletList',
    isActive: (editor) => editor.isActive('bulletList'),
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    name: 'ordered-list',
    label: 'Numbered list',
    shortcutId: 'ordered-list',
    icon: ListOrdered,
    requires: 'orderedList',
    isActive: (editor) => editor.isActive('orderedList'),
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    name: 'blockquote',
    label: 'Quote',
    shortcutId: 'blockquote',
    icon: Quote,
    requires: 'blockquote',
    isActive: (editor) => editor.isActive('blockquote'),
    run: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    name: 'code',
    label: 'Code',
    shortcutId: 'code',
    icon: Code,
    requires: 'code',
    isActive: (editor) => editor.isActive('code'),
    run: (editor) => editor.chain().focus().toggleCode().run(),
  },
  {
    name: 'code-block',
    label: 'Code block',
    shortcutId: 'code-block',
    icon: SquareCode,
    requires: 'codeBlock',
    isActive: (editor) => editor.isActive('codeBlock'),
    run: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    name: 'image',
    label: 'Insert picture',
    shortcutId: 'insert-image',
    icon: ImagePlus,
    requires: 'image',
    run: (editor) => editor.chain().focus().chooseImages().run(),
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
