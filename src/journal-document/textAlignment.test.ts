import { createTestEditor } from '../test/createTestEditor'
import { documentExtensions } from './documentExtensions'

const IMAGE_ID = `${'a'.repeat(64)}.png`

function createEditor(content: string) {
  return createTestEditor({ extensions: documentExtensions, content })
}

describe('text alignment', () => {
  it('lines up the cursor’s block, or every block selected', () => {
    const editor = createEditor('<p>one</p><h2>two</h2><p>three</p>')
    editor.commands.setTextSelection(2)
    editor.commands.setTextAlignment('center')
    expect(editor.getHTML()).toBe(
      '<p data-align="center">one</p><h2>two</h2><p>three</p>',
    )
    editor.commands.selectAll()
    editor.commands.setTextAlignment('end')
    expect(editor.getHTML()).toBe(
      '<p data-align="end">one</p><h2 data-align="end">two</h2><p data-align="end">three</p>',
    )
    editor.commands.unsetTextAlignment()
    expect(editor.getHTML()).toBe('<p>one</p><h2>two</h2><p>three</p>')
  })

  it('lines up a selected picture', () => {
    const editor = createEditor(
      `<p>one</p><img data-image-id="${IMAGE_ID}" alt="">`,
    )
    editor.commands.setNodeSelection(5)
    editor.commands.setTextAlignment('center')
    expect(editor.getJSON().content?.[1].attrs?.alignment).toBe('center')
  })

  it('reads only the alignments it knows', () => {
    const editor = createEditor(
      '<p data-align="center">kept</p><p data-align="justify">dropped</p>',
    )
    expect(editor.getHTML()).toBe(
      '<p data-align="center">kept</p><p>dropped</p>',
    )
  })

  it('goes with the rest of the text’s own look on Update text to match style', () => {
    const editor = createEditor('<p data-align="center"><em>one</em></p>')
    editor.commands.setTextSelection(2)
    editor.commands.clearOwnLook()
    expect(editor.getHTML()).toBe('<p>one</p>')
  })
})
