import { documentExtensions } from './documentExtensions'
import { CAPITAL_LETTER_CLASS } from './textCase'
import { createTestEditor } from '../test/createTestEditor'

function renderWithCase(text: string, textCase: string) {
  const editor = createTestEditor({
    extensions: documentExtensions,
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text,
              marks: [{ type: 'textCase', attrs: { textCase } }],
            },
          ],
        },
      ],
    },
  })
  const capitals = [
    ...editor.view.dom.querySelectorAll(`.${CAPITAL_LETTER_CLASS}`),
  ].map(({ textContent }) => textContent)
  return { editor, capitals }
}

describe('TextCaseMark', () => {
  it('keeps the typed letters and marks only sentence starts as capitals', () => {
    const { editor, capitals } = renderWithCase(
      'hello there. how are you',
      'sentence',
    )
    expect(editor.getText()).toBe('hello there. how are you')
    expect(capitals).toEqual(['h', 'h'])
  })

  it('marks word starts for title case', () => {
    expect(renderWithCase('rain all day', 'title').capitals).toEqual([
      'r',
      'a',
      'd',
    ])
  })

  it('needs no decorations for upper or lower case', () => {
    expect(renderWithCase('rain', 'upper').capitals).toEqual([])
  })

  it('applies to text typed after setting it', () => {
    const editor = createTestEditor({
      extensions: documentExtensions,
      content: '<p></p>',
    })
    editor.chain().focus().setTextCase('upper').insertContent('shout').run()
    expect(editor.getJSON().content?.[0].content?.[0].marks).toEqual([
      { type: 'textCase', attrs: { textCase: 'upper' } },
    ])
  })
})

describe('TextCaseMark capitals while editing', () => {
  const capitalsOf = (editor: ReturnType<typeof createTestEditor>) =>
    [...editor.view.dom.querySelectorAll(`.${CAPITAL_LETTER_CLASS}`)].map(
      ({ textContent }) => textContent,
    )

  it('follows edits inside cased text, and edits elsewhere leave it be', () => {
    const { editor } = renderWithCase('rain all day', 'title')
    editor.commands.insertContentAt(1, 'cold ')
    expect(capitalsOf(editor)).toEqual(['c', 'r', 'a', 'd'])
    editor.commands.insertContentAt(editor.state.doc.content.size, {
      type: 'paragraph',
      content: [{ type: 'text', text: 'plain' }],
    })
    expect(capitalsOf(editor)).toEqual(['c', 'r', 'a', 'd'])
  })

  it('shows capitals when a case is set on existing text, and drops them when unset', () => {
    const editor = createTestEditor({
      extensions: documentExtensions,
      content: '<p>first</p><p>rain all day</p>',
    })
    const secondStart = editor.state.doc.firstChild?.nodeSize ?? 0
    const secondEnd = editor.state.doc.content.size
    editor
      .chain()
      .setTextSelection({ from: secondStart + 1, to: secondEnd - 1 })
      .setTextCase('title')
      .run()
    expect(capitalsOf(editor)).toEqual(['r', 'a', 'd'])
    editor.commands.unsetTextCase()
    expect(capitalsOf(editor)).toEqual([])
  })
})

describe('TextCaseMark with cases from text styles', () => {
  const capitalsOf = (editor: ReturnType<typeof createTestEditor>) =>
    [...editor.view.dom.querySelectorAll(`.${CAPITAL_LETTER_CLASS}`)].map(
      ({ textContent }) => textContent,
    )
  const headingsInTitleCase = (editor: ReturnType<typeof createTestEditor>) =>
    editor.commands.setBlockTextCases((block) =>
      block.type.name === 'heading' ? 'title' : null,
    )

  it('capitalizes blocks whose style has a case, and redraws when the cases change', () => {
    const editor = createTestEditor({
      extensions: documentExtensions,
      content: '<h2>rainy day</h2><p>plain words</p>',
    })
    expect(capitalsOf(editor)).toEqual([])
    headingsInTitleCase(editor)
    expect(capitalsOf(editor)).toEqual(['r', 'd'])
    editor.commands.setBlockTextCases(() => null)
    expect(capitalsOf(editor)).toEqual([])
  })

  it("shows text set to as typed without its style's capitals", () => {
    const editor = createTestEditor({
      extensions: documentExtensions,
      content: '<h2>rainy <span data-text-case="as-typed">day out</span></h2>',
    })
    headingsInTitleCase(editor)
    expect(capitalsOf(editor)).toEqual(['r'])
    expect(editor.getHTML()).toContain('data-text-case="as-typed"')
  })

  it("lets the text's own case win, and leaves code as typed", () => {
    const editor = createTestEditor({
      extensions: documentExtensions,
      content:
        '<h2>rainy <span data-text-case="upper">day</span> <code>npm run</code></h2>',
    })
    headingsInTitleCase(editor)
    expect(capitalsOf(editor)).toEqual(['r'])
  })

  it('follows a block into a style with a case, and isn’t undone', () => {
    const editor = createTestEditor({
      extensions: documentExtensions,
      content: '<p>rainy day</p>',
    })
    headingsInTitleCase(editor)
    editor.commands.setHeading({ level: 2 })
    expect(capitalsOf(editor)).toEqual(['r', 'd'])
    editor.commands.undo()
    expect(editor.isActive('heading')).toBe(false)
    expect(capitalsOf(editor)).toEqual([])
  })
})
