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
      '# Today\n\nA **good** *day*.\n\n- tea\n\n> quiet\n',
    )
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
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Morning' }],
      },
      { type: 'paragraph', content: [{ type: 'text', text: 'Rain all day.' }] },
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'Later' }],
      },
    ],
  }

  it('puts the title first and moves content headings down a level', () => {
    const editor = createTestEditor({ extensions: editorExtensions, content })
    expect(getEditorMarkdown(editor, 'Sunday')).toBe(
      '# Sunday\n\n## Morning\n\nRain all day.\n\n#### Later\n',
    )
  })

  it('leaves the content as written without a title', () => {
    const editor = createTestEditor({ extensions: editorExtensions, content })
    expect(getEditorMarkdown(editor)).toBe(
      '# Morning\n\nRain all day.\n\n### Later\n',
    )
  })

  it('escapes markdown in the title', () => {
    const editor = createTestEditor({ extensions: editorExtensions, content })
    expect(getEditorMarkdown(editor, 'Tea * toast').split('\n')[0]).toBe(
      '# Tea \\* toast',
    )
  })
})
