import type { JSONContent } from '@tiptap/core'
import { createTestEditor } from '../../test/createTestEditor'
import { editorExtensions } from './editorExtensions'
import { getEditorMarkdown } from './getEditorMarkdown'

const paragraph = (text: string): JSONContent => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
})

/** Exports to markdown, then reads that markdown back the way a markdown app would. */
function roundTrip(content: JSONContent[]) {
  const markdown = getEditorMarkdown(
    createTestEditor({
      extensions: editorExtensions,
      content: { type: 'doc', content },
    }),
  )
  const reread = createTestEditor({
    extensions: editorExtensions,
    content: markdown,
    contentType: 'markdown',
  })
  const blocks: JSONContent[] = reread.getJSON().content ?? []
  return blocks
}

const textOf = ({ text, content = [] }: JSONContent): string =>
  text ?? content.map(textOf).join('')

const blockTypes = (blocks: JSONContent[]) =>
  blocks.map(({ type, attrs }) =>
    type === 'heading' ? `h${attrs?.level}` : type,
  )

describe('markdown export survives being read back', () => {
  it('keeps real structure', () => {
    const blocks = roundTrip([
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Title' }],
      },
      paragraph('Body'),
      {
        type: 'bulletList',
        content: [{ type: 'listItem', content: [paragraph('item')] }],
      },
      { type: 'blockquote', content: [paragraph('quoted')] },
    ])
    expect(blockTypes(blocks)).toEqual([
      'h2',
      'paragraph',
      'bulletList',
      'blockquote',
    ])
  })

  it.each([
    '# not a heading',
    '1. not a list',
    '- not a bullet',
    '---',
    '> not a quote',
    '```not code',
  ])('keeps the paragraph %j as text', (text) => {
    const [block, ...rest] = roundTrip([paragraph(text)])
    expect(rest).toEqual([])
    expect(block.type).toBe('paragraph')
    expect(textOf(block)).toBe(text)
  })

  it('keeps special characters as written', () => {
    const text = '2 * 3 = 6, snake_case, [brackets], <tag>, back\\slash'
    const [block] = roundTrip([paragraph(text)])
    expect(textOf(block)).toBe(text)
  })
})
