import type { JSONContent } from '@tiptap/core'
import { createDocumentComparer, parseDocument } from './validateDocument'

const paragraph = (
  text: string,
  marks?: JSONContent['marks'],
): JSONContent => ({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text, ...(marks && { marks }) }],
    },
  ],
})

describe('parseDocument', () => {
  it('accepts a valid document, including colored text', () => {
    const colored = paragraph('hi', [
      { type: 'textStyle', attrs: { color: '#aa3344' } },
    ])
    expect(parseDocument(colored)).toMatchObject(colored)
  })

  it('rejects unknown node types and non-documents', () => {
    expect(
      parseDocument({ type: 'doc', content: [{ type: 'script' }] }),
    ).toBeNull()
    expect(parseDocument(paragraph('hi').content?.[0])).toBeNull()
    expect(parseDocument('<p>hi</p>')).toBeNull()
  })

  it('drops attributes the schema does not define', () => {
    const withExtra = {
      type: 'doc',
      content: [{ type: 'paragraph', attrs: { onclick: 'x' } }],
    }
    expect(JSON.stringify(parseDocument(withExtra))).not.toContain('onclick')
  })
})

describe('createDocumentComparer', () => {
  it('matches documents with the same content regardless of key order', () => {
    const comparer = createDocumentComparer([paragraph('same')])
    const reordered = {
      content: [
        { content: [{ text: 'same', type: 'text' }], type: 'paragraph' },
      ],
      type: 'doc',
    }
    expect(comparer.hasEqual(reordered)).toBe(true)
    expect(comparer.hasEqual(paragraph('different'))).toBe(false)
  })

  it('treats formatting differences as different content', () => {
    const comparer = createDocumentComparer([paragraph('same')])
    expect(comparer.hasEqual(paragraph('same', [{ type: 'bold' }]))).toBe(false)
  })
})
