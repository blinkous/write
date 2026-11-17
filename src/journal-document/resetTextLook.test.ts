import { createTestEditor } from '../test/createTestEditor'
import { titleExtensions } from './titleExtensions'

describe('resetTextLook', () => {
  it("clears the title's own look on ⌘\\", () => {
    const editor = createTestEditor({
      extensions: titleExtensions,
      content:
        '<p><strong>rainy</strong> <span data-glow="theme-3">day</span></p>',
    })
    editor.commands.setTextSelection(2)
    editor.commands.keyboardShortcut('Mod-\\')
    expect(editor.getHTML()).toBe('<p>rainy day</p>')
  })
})
