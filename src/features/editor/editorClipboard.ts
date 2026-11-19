import {
  getHTMLFromFragment,
  type Editor,
  type JSONContent,
} from '@tiptap/core'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Selection } from '@tiptap/pm/state'
import type { RichClipboardContent } from '../../lib/clipboard'
import {
  documentToMarkdown,
  withHeader,
  type MarkdownHeader,
} from './getEditorMarkdown'

function documentToHtml(editor: Editor, document: JSONContent): string {
  const { schema } = editor
  return getHTMLFromFragment(
    ProseMirrorNode.fromJSON(schema, document).content,
    schema,
  )
}

/**
 * A journal document for copying: markdown as plain text (for plain-text
 * apps) and the same as HTML, so pasting into the journal or an app that
 * takes formatting keeps it, as ⌘C does.
 */
export function documentToClipboard(
  editor: Editor,
  document: JSONContent,
  header: MarkdownHeader = { title: null },
): RichClipboardContent {
  return {
    text: documentToMarkdown(editor, document, header),
    html: documentToHtml(editor, withHeader(document, header)),
  }
}

/**
 * The selected text inside one block, when it's only part of that block.
 * Returns null for a whole block or a selection across blocks.
 */
function getPartOfOneBlock({ $from, $to }: Selection) {
  const block = $from.parent
  const isInOneBlock = block.isTextblock && $from.sameParent($to)
  const isWholeBlock =
    $from.parentOffset === 0 && $to.parentOffset === block.content.size
  if (!isInOneBlock || isWholeBlock) return null
  return block.cut($from.parentOffset, $to.parentOffset)
}

/**
 * The editor's selection for copying, or null when nothing is selected.
 * Part of one block is inline (a few words of a heading aren't a heading;
 * code is as typed); a whole block or more keeps its block formatting.
 */
export function getSelectionClipboard(
  editor: Editor,
): RichClipboardContent | null {
  const { selection } = editor.state
  if (selection.empty) return null
  const partOfOneBlock = getPartOfOneBlock(selection)
  const isCode = partOfOneBlock?.type.spec.code === true
  const content: JSONContent[] = partOfOneBlock
    ? [
        {
          type: 'paragraph',
          // Code's text goes as typed, without the block around it.
          content: isCode
            ? [{ type: 'text', text: partOfOneBlock.textContent }]
            : partOfOneBlock.content.toJSON(),
        },
      ]
    : selection.content().content.toJSON()
  const document = { type: 'doc', content }
  const { text, html } = documentToClipboard(editor, document)
  return {
    text: isCode ? partOfOneBlock.textContent : text.replace(/\n$/, ''),
    html,
  }
}
