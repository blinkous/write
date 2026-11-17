import { createTestEditor } from '../../test/createTestEditor'
import { editorExtensions } from './editorExtensions'
import { matchTextToStyle } from './matchTextToStyle'
import { TEXT_STYLES } from './textStyles'

const headingTwo = TEXT_STYLES.find(({ name }) => name === 'heading-2')

function createEditor(content: string) {
  return createTestEditor({ extensions: editorExtensions, content })
}

describe('matchTextToStyle', () => {
  it("gives the cursor's paragraph the style and drops its own look, keeping links", () => {
    const editor = createEditor(
      '<p><strong>rainy</strong> <span data-font="lora" data-no-bold="">day</span> <a href="https://example.com">out</a></p>',
    )
    editor.commands.setTextSelection(3)
    matchTextToStyle(editor, headingTwo ?? null)
    expect(editor.getHTML()).toBe(
      '<h2>rainy day <a target="_blank" rel="noopener noreferrer nofollow" href="https://example.com">out</a></h2><p></p>',
    )
  })

  it('only touches the selected text when there is a selection', () => {
    const editor = createEditor('<p><em>rainy</em> <em>day</em></p>')
    editor.commands.setTextSelection({ from: 1, to: 6 })
    matchTextToStyle(editor, null)
    expect(editor.getHTML()).toBe('<p>rainy <em>day</em></p>')
  })

  it('is one undo step', () => {
    const editor = createEditor('<p><em>rainy</em></p>')
    editor.commands.setTextSelection(2)
    matchTextToStyle(editor, headingTwo ?? null)
    editor.commands.undo()
    expect(editor.getHTML()).toBe('<p><em>rainy</em></p>')
  })
})
