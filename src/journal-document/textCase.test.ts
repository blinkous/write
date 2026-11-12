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
