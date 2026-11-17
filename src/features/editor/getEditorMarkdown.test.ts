import { editorExtensions } from './editorExtensions'
import { getEditorMarkdown } from './getEditorMarkdown'
import { createTestEditor } from '../../test/createTestEditor'

describe('getEditorMarkdown', () => {
  it('exports formatted content as markdown', () => {
    const editor = createTestEditor({
      extensions: editorExtensions,
      content:
        '<h1>Today</h1><p>A <strong>good</strong> <em>day</em>.</p><ul><li><p>tea</p></li></ul><blockquote><p>quiet</p></blockquote>',
    })
    expect(getEditorMarkdown(editor)).toBe(
      // A pasted <h1> becomes a content heading: `#` is reserved for the title.
      '## Today\n\nA **good** *day*.\n\n- tea\n\n> quiet\n',
    )
  })

  it("leaves out a style's emphasis turned off, which markdown can't say", () => {
    const editor = createTestEditor({
      extensions: editorExtensions,
      content: '<h2><span data-no-bold="">rainy</span> day</h2>',
    })
    expect(getEditorMarkdown(editor)).toBe('## rainy day\n')
  })

  it('keeps an indent on the very first line', () => {
    const editor = createTestEditor({
      extensions: editorExtensions,
      content: {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: '\tFirst' }] },
        ],
      },
    })
    expect(getEditorMarkdown(editor)).toBe('\u2003\u2003First\n')
  })
})

describe('getEditorMarkdown with a title', () => {
  const content = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Morning' }],
      },
      { type: 'paragraph', content: [{ type: 'text', text: 'Rain all day.' }] },
      {
        type: 'heading',
        attrs: { level: 4 },
        content: [{ type: 'text', text: 'Later' }],
      },
    ],
  }

  it('puts the title first, as the one `#` heading, with content headings as written', () => {
    const editor = createTestEditor({ extensions: editorExtensions, content })
    expect(getEditorMarkdown(editor, 'Sunday')).toBe(
      '# Sunday\n\n## Morning\n\nRain all day.\n\n#### Later\n',
    )
  })

  it('leaves the content as written without a title', () => {
    const editor = createTestEditor({ extensions: editorExtensions, content })
    expect(getEditorMarkdown(editor)).toBe(
      '## Morning\n\nRain all day.\n\n#### Later\n',
    )
  })

  it('escapes markdown in the title', () => {
    const editor = createTestEditor({ extensions: editorExtensions, content })
    expect(getEditorMarkdown(editor, 'Tea * toast').split('\n')[0]).toBe(
      '# Tea \\* toast',
    )
  })
})
