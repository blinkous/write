import type { Editor } from '@tiptap/react'
import {
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Type,
  type LucideIcon,
} from 'lucide-react'
import type { ParagraphSize } from '../../journal-document'

type HeadingLevel = 1 | 2 | 3

/** What a style is in the document: a heading level, or a paragraph (body or a size). */
type TextStyleBlock =
  | { kind: 'heading'; level: HeadingLevel }
  | { kind: 'paragraph'; size: ParagraphSize | null }

export type TextStyle = {
  name: string
  label: string
  /** Shown in the toolbar for the current style, and beside the label in the menu. */
  icon: LucideIcon
  block: TextStyleBlock
}

/** Paragraph styles, smallest to largest; ⌘⇧> / ⌘⇧< step through them in this order. */
export const TEXT_STYLES: readonly TextStyle[] = [
  {
    name: 'small',
    label: 'Small',
    icon: Type,
    block: { kind: 'paragraph', size: 'small' },
  },
  {
    name: 'body',
    label: 'Body',
    icon: Pilcrow,
    block: { kind: 'paragraph', size: null },
  },
  {
    name: 'heading-3',
    label: 'Heading 3',
    icon: Heading3,
    block: { kind: 'heading', level: 3 },
  },
  {
    name: 'heading-2',
    label: 'Heading 2',
    icon: Heading2,
    block: { kind: 'heading', level: 2 },
  },
  {
    name: 'heading-1',
    label: 'Heading 1',
    icon: Heading1,
    block: { kind: 'heading', level: 1 },
  },
]

const BODY_STYLE =
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

export function applyTextStyle(editor: Editor, { block }: TextStyle): boolean {
  const chain = editor.chain().focus()
  if (block.kind === 'heading')
    return chain.setHeading({ level: block.level }).run()
  return chain
    .setParagraph()
    .updateAttributes('paragraph', { size: block.size })
    .run()
}

/** Moves the current paragraph one style larger (1) or smaller (-1); stops at the ends. */
export function stepTextStyle(editor: Editor, direction: 1 | -1): boolean {
  const currentIndex = TEXT_STYLES.indexOf(getActiveTextStyle(editor))
  const nextStyle = TEXT_STYLES[currentIndex + direction]
  // Handled even at the ends, so the shortcut never falls through to the browser.
  return nextStyle ? applyTextStyle(editor, nextStyle) : true
}
