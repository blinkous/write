import { Editor } from '@tiptap/core'
import { editorExtensions } from './editorExtensions'
import { getEditorMarkdown } from './getEditorMarkdown'

describe('getEditorMarkdown', () => {
  it('exports formatted content as markdown', () => {
    const editor = new Editor({
      extensions: editorExtensions,
      content:
        '<h1>Today</h1><p>A <strong>good</strong> <em>day</em>.</p><ul><li><p>tea</p></li></ul><blockquote><p>quiet</p></blockquote>',
    })
    expect(getEditorMarkdown(editor)).toBe(
      '# Today\n\nA **good** *day*.\n\n- tea\n\n> quiet\n',
    )
  })

  it('keeps an indent on the very first line', () => {
    const editor = new Editor({
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
