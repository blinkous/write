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

const activeName = (editor: ReturnType<typeof editorWith>) =>
  getActiveTextStyle(editor).name

describe('text styles', () => {
  it('reads the style at the cursor', () => {
    expect(activeName(editorWith('<p>plain</p>'))).toBe('body')
    expect(activeName(editorWith('<h2>title</h2>'))).toBe('heading-2')
  })

  it('steps up from body through H3 and H2 to H1, then stops', () => {
    const editor = editorWith('<p>grow me</p>')
    const steps = [1, 2, 3, 4].map(() => {
      stepTextStyle(editor, 1)
      return activeName(editor)
    })
    expect(steps).toEqual(['heading-3', 'heading-2', 'heading-1', 'heading-1'])
    // Trimmed: an empty paragraph is kept after a final heading so writing can continue below.
    expect(editor.getText().trim()).toBe('grow me')
  })

  it('steps down through body to small and stops there', () => {
    const editor = editorWith('<h2>shrink me</h2>')
    stepTextStyle(editor, -1)
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
})
