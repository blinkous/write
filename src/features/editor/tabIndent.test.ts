import { type Editor, type Content } from '@tiptap/core'
import { editorExtensions } from './editorExtensions'
import { replaceTabsOutsideCode } from './getEditorMarkdown'
import { createTestEditor } from '../../test/createTestEditor'

function createEditor(content: Content) {
  return createTestEditor({ extensions: editorExtensions, content })
}

/** Sends a key through the editor's keyboard handling; true if the editor handled it. */
function pressKey(editor: Editor, key: string, shiftKey = false) {
  const event = new KeyboardEvent('keydown', { key, shiftKey })
  return (
    editor.view.someProp('handleKeyDown', (handleKeyDown) =>
      handleKeyDown(editor.view, event),
    ) === true
  )
}

describe('TabIndent', () => {
  it('inserts a tab at the cursor', () => {
    const editor = createEditor('<p>indent me</p>')
    editor.commands.setTextSelection(1)
    expect(pressKey(editor, 'Tab')).toBe(true)
    expect(editor.getText()).toBe('\tindent me')
  })

  it('removes a tab from the start of the line with Shift+Tab', () => {
    const editor = createEditor({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: '\tindented' }] },
      ],
    })
    editor.commands.setTextSelection(5)
    expect(pressKey(editor, 'Tab', true)).toBe(true)
    expect(editor.getText()).toBe('indented')
  })

  it('indents list items instead of inserting a tab', () => {
    const editor = createEditor(
      '<ul><li><p>one</p></li><li><p>two</p></li></ul>',
    )
    editor.commands.setTextSelection(editor.state.doc.content.size - 3)
    pressKey(editor, 'Tab')
    expect(editor.getText()).not.toContain('\t')
    expect(editor.getHTML()).toContain('<ul><li><p>two</p></li></ul>')
  })

  it('lets Escape then Tab leave the editor, so keyboard users are not trapped', () => {
    const editor = createEditor('<p>text</p>')
    editor.commands.setTextSelection(1)
    pressKey(editor, 'Escape')
    expect(pressKey(editor, 'Tab')).toBe(false)
    expect(editor.getText()).toBe('text')
  })

  it('goes back to inserting tabs after any other key', () => {
    const editor = createEditor('<p>text</p>')
    editor.commands.setTextSelection(1)
    pressKey(editor, 'Escape')
    pressKey(editor, 'a')
    expect(pressKey(editor, 'Tab')).toBe(true)
  })
})

describe('replaceTabsOutsideCode', () => {
  it('turns tabs into em spaces so a leading tab is not a code block', () => {
    expect(replaceTabsOutsideCode('\tindented\nmid\tline')).toBe(
      '  indented\nmid  line',
    )
  })

  it('keeps tabs inside fenced code', () => {
    expect(replaceTabsOutsideCode('```\n\tcode\n```\n\ttext')).toBe(
      '```\n\tcode\n```\n  text',
    )
  })
})
