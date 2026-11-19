import type { Editor } from '@tiptap/core'
import { createTestEditor } from '../test/createTestEditor'
import { documentExtensions } from './documentExtensions'
import { EMPHASES, isEmphasisShown, type Emphasis } from './textEmphasis'

const NO_EMPHASIS = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
}

/** Headings get this emphasis from their style; paragraphs get none. */
function styleHeadings(
  editor: Editor,
  emphasis: Partial<Record<Emphasis, boolean>>,
) {
  editor.commands.setBlockEmphasis((block) =>
    block.type.name === 'heading' ? { ...NO_EMPHASIS, ...emphasis } : null,
  )
}

function createEditor(content: string) {
  return createTestEditor({ extensions: documentExtensions, content })
}

const linedTexts = (editor: Editor, className: string) =>
  [...editor.view.dom.querySelectorAll(`.${className}`)].map(
    ({ textContent }) => textContent,
  )

describe('TextEmphasis', () => {
  it("shows a style's bold as on, and turns it off for the selected text only", () => {
    const editor = createEditor('<h2>rainy day</h2>')
    styleHeadings(editor, { bold: true })
    editor.commands.setTextSelection({ from: 1, to: 6 })
    expect(isEmphasisShown(editor, 'bold')).toBe(true)

    editor.commands.toggleEmphasis('bold')
    expect(isEmphasisShown(editor, 'bold')).toBe(false)
    expect(editor.isActive('bold')).toBe(false)
    expect(editor.getHTML()).toContain('<span data-no-bold="">rainy</span> day')

    editor.commands.toggleEmphasis('bold')
    expect(isEmphasisShown(editor, 'bold')).toBe(true)
    // Back to following its style: no off, and no bold of its own either.
    expect(editor.getHTML()).toBe('<h2>rainy day</h2><p></p>')
  })

  it('toggles its own mark where the style has none', () => {
    const editor = createEditor('<p>rainy day</p>')
    editor.commands.setTextSelection({ from: 1, to: 6 })
    expect(isEmphasisShown(editor, 'italic')).toBe(false)
    editor.commands.toggleEmphasis('italic')
    expect(editor.getHTML()).toBe('<p><em>rainy</em> day</p>')
    editor.commands.toggleEmphasis('italic')
    expect(editor.getHTML()).toBe('<p>rainy day</p>')
  })

  it("turns off text's own bold inside a bold style rather than stacking an off on it", () => {
    const editor = createEditor('<p><strong>rainy</strong> day</p>')
    editor.commands.setTextSelection({ from: 1, to: 6 })
    editor.commands.toggleEmphasis('bold')
    expect(editor.getHTML()).toBe('<p>rainy day</p>')
  })

  it("draws a style's lines on its text, skipping text that turned them off", () => {
    const editor = createEditor(
      '<h2>rainy <span data-no-underline="">day</span></h2><p>plain</p>',
    )
    expect(linedTexts(editor, 'style-underline')).toEqual([])
    styleHeadings(editor, { underline: true, strike: true })
    expect(linedTexts(editor, 'style-underline')).toEqual(['rainy '])
    expect(linedTexts(editor, 'style-strike')).toEqual(['rainy ', 'day'])
    styleHeadings(editor, {})
    expect(linedTexts(editor, 'style-strike')).toEqual([])
  })

  it('keeps the lines in step while typing', () => {
    const editor = createEditor('<h2>rainy</h2>')
    styleHeadings(editor, { underline: true })
    editor.commands.insertContentAt(6, ' day')
    expect(linedTexts(editor, 'style-underline')).toEqual(['rainy day'])
  })

  it("restores each off from copied HTML, and turning styles on isn't an undo step", () => {
    for (const emphasis of EMPHASES) {
      const dataAttribute = {
        bold: 'data-no-bold',
        italic: 'data-no-italic',
        underline: 'data-no-underline',
        strike: 'data-no-strike',
      }[emphasis]
      const editor = createEditor(
        `<h2><span ${dataAttribute}="">day</span></h2>`,
      )
      styleHeadings(editor, { [emphasis]: true })
      editor.commands.setTextSelection({ from: 1, to: 4 })
      expect(isEmphasisShown(editor, emphasis)).toBe(false)
      expect(editor.can().undo()).toBe(false)
    }
  })

  it('toggles what is shown', () => {
    const editor = createEditor('<h2>rainy</h2>')
    styleHeadings(editor, { bold: true })
    editor.commands.setTextSelection({ from: 1, to: 6 })
    editor.commands.toggleEmphasis('bold')
    expect(editor.getHTML()).toBe(
      '<h2><span data-no-bold="">rainy</span></h2><p></p>',
    )
  })
})
