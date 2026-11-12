import { type Editor } from '@tiptap/core'
import { editorExtensions } from './editorExtensions'
import { createTestEditor } from '../../test/createTestEditor'

function createEditor(markdown: string) {
  return createTestEditor({
    extensions: editorExtensions,
    content: markdown,
    contentType: 'markdown',
  })
}

/** Places the cursor inside the first text node containing `text`. */
function placeCursorIn(editor: Editor, text: string) {
  let cursorPosition = -1
  editor.state.doc.descendants((node, position) => {
    if (cursorPosition === -1 && node.isText && node.text?.includes(text))
      cursorPosition = position + 1
  })
  editor.commands.setTextSelection(cursorPosition)
}

describe('moveBlocks', () => {
  it('moves a paragraph down and back up, keeping the cursor in it', () => {
    const editor = createEditor('first\n\nsecond\n\nthird')
    placeCursorIn(editor, 'first')
    editor.commands.moveBlocks('down')
    expect(editor.getMarkdown().trim()).toBe('second\n\nfirst\n\nthird')
    editor.commands.moveBlocks('down')
    expect(editor.getMarkdown().trim()).toBe('second\n\nthird\n\nfirst')
    editor.commands.moveBlocks('up')
    expect(editor.getMarkdown().trim()).toBe('second\n\nfirst\n\nthird')
    expect(editor.state.selection.$from.parent.textContent).toBe('first')
  })

  it('does nothing at the start or end of the document', () => {
    const editor = createEditor('first\n\nsecond')
    placeCursorIn(editor, 'first')
    expect(editor.commands.moveBlocks('up')).toBe(false)
    expect(editor.getMarkdown().trim()).toBe('first\n\nsecond')
  })

  it('moves list items within their list', () => {
    const editor = createEditor('- apple\n- banana\n- cherry')
    placeCursorIn(editor, 'cherry')
    editor.commands.moveBlocks('up')
    expect(editor.getMarkdown().trim()).toBe('- apple\n- cherry\n- banana')
  })

  it('keeps an edge list item inside its list', () => {
    const editor = createEditor('intro\n\n- apple\n- banana')
    placeCursorIn(editor, 'apple')
    expect(editor.commands.moveBlocks('up')).toBe(false)
  })

  it('moves a container when the selection fills it', () => {
    const editor = createEditor('intro\n\n> quoted')
    placeCursorIn(editor, 'quoted')
    editor.commands.moveBlocks('up')
    expect(editor.getMarkdown().trim()).toBe('> quoted\n\nintro')
  })
})
