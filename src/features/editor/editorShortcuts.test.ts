import {
  assignShortcut,
  resetAllShortcuts,
} from '../../keyboard-shortcuts/shortcutStore'
import { createTestEditor } from '../../test/createTestEditor'
import { editorExtensions } from './editorExtensions'

function createEditor(content: string) {
  const editor = createTestEditor({ extensions: editorExtensions, content })
  editor.commands.selectAll()
  return editor
}

afterEach(resetAllShortcuts)

describe('EditorShortcuts', () => {
  it('runs actions on their default shortcuts', () => {
    const editor = createEditor('<p>rainy</p>')
    editor.commands.keyboardShortcut('Mod-b')
    expect(editor.getHTML()).toBe('<p><strong>rainy</strong></p>')
    editor.commands.keyboardShortcut('Mod-Alt-2')
    expect(editor.getHTML()).toBe('<h2><strong>rainy</strong></h2><p></p>')
  })

  it('runs an action on the shortcut someone gave it', () => {
    assignShortcut('bold', 'Mod-k')
    const editor = createEditor('<p>rainy</p>')
    editor.commands.keyboardShortcut('Mod-k')
    expect(editor.getHTML()).toBe('<p><strong>rainy</strong></p>')
  })

  it('leaves a moved shortcut doing nothing, even through Tiptap’s own keys', () => {
    assignShortcut('bold', 'Mod-k')
    assignShortcut('blockquote', null)
    const editor = createEditor('<p>rainy</p>')
    editor.commands.keyboardShortcut('Mod-b')
    editor.commands.keyboardShortcut('Mod-Shift-b')
    expect(editor.getHTML()).toBe('<p>rainy</p>')
  })
})
