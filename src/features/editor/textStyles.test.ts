import { createTestEditor } from '../../test/createTestEditor'
import { editorExtensions } from './editorExtensions'
import {
  applyTextStyle,
  getActiveTextStyle,
  stepTextStyle,
  TEXT_STYLES,
} from './textStyles'

function editorWith(html: string) {
  const editor = createTestEditor({
    extensions: editorExtensions,
    content: html,
  })
  editor.commands.setTextSelection(1)
  return editor
}

/** Types like a person would, so markdown shortcuts (input rules) run. */
function typeInto(editor: ReturnType<typeof editorWith>, text: string) {
  for (const character of text) {
    const { from, to } = editor.state.selection
    const insert = () => editor.state.tr.insertText(character, from, to)
    const handled = editor.view.someProp('handleTextInput', (handleTextInput) =>
      handleTextInput(editor.view, from, to, character, insert),
    )
    if (!handled) editor.view.dispatch(insert())
  }
}

const activeName = (editor: ReturnType<typeof editorWith>) =>
  getActiveTextStyle(editor).name

describe('text styles', () => {
  it('reads the style at the cursor', () => {
    expect(activeName(editorWith('<p>plain</p>'))).toBe('body')
    expect(activeName(editorWith('<h2>title</h2>'))).toBe('heading-2')
    expect(activeName(editorWith('<h5>small heading</h5>'))).toBe('heading-5')
  })

  it('steps up from body through H6 … H2, then stops (H1 is the title)', () => {
    const editor = editorWith('<p>grow me</p>')
    const steps = [1, 2, 3, 4, 5, 6].map(() => {
      stepTextStyle(editor, 1)
      return activeName(editor)
    })
    expect(steps).toEqual([
      'heading-6',
      'heading-5',
      'heading-4',
      'heading-3',
      'heading-2',
      'heading-2',
    ])
    // Trimmed: an empty paragraph is kept after a final heading so writing can continue below.
    expect(editor.getText().trim()).toBe('grow me')
  })

  it('steps down through body to small and stops there', () => {
    const editor = editorWith('<h6>shrink me</h6>')
    stepTextStyle(editor, -1)
    expect(activeName(editor)).toBe('body')
    stepTextStyle(editor, -1)
    expect(activeName(editor)).toBe('small')
    expect(stepTextStyle(editor, -1)).toBe(true)
    expect(activeName(editor)).toBe('small')
    stepTextStyle(editor, 1)
    expect(activeName(editor)).toBe('body')
  })

  it('copies small text as a plain paragraph and starts body text after Enter', () => {
    const editor = editorWith('<p>note</p>')
    stepTextStyle(editor, -1)
    expect(editor.getMarkdown().trim()).toBe('note')
    editor.commands.setTextSelection(5)
    editor.commands.splitBlock()
    expect(activeName(editor)).toBe('body')
  })

  it('applies any style directly, and it copies as markdown', () => {
    const editor = editorWith('<p>Sunday</p>')
    const headingTwo = TEXT_STYLES.find(({ name }) => name === 'heading-2')
    if (!headingTwo) throw new Error('missing style')
    applyTextStyle(editor, headingTwo)
    expect(editor.getMarkdown().trim()).toBe('## Sunday')
  })

  it('keeps # reserved: typing `# ` stays text, `## ` makes an H2', () => {
    const typedHash = editorWith('<p></p>')
    typeInto(typedHash, '# ')
    expect(activeName(typedHash)).toBe('body')
    const typedDoubleHash = editorWith('<p></p>')
    typeInto(typedDoubleHash, '## ')
    expect(activeName(typedDoubleHash)).toBe('heading-2')
  })
})
