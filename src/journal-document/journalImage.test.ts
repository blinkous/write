import type { JSONContent } from '@tiptap/core'
import { createTestEditor } from '../test/createTestEditor'
import { documentExtensions } from './documentExtensions'
import { Markdown } from '@tiptap/markdown'
import { collectImageIds } from './journalImage'
import { parseDocument } from './validateDocument'

const IMAGE_ID = `${'a'.repeat(64)}.gif`
const OTHER_IMAGE_ID = `${'b'.repeat(64)}.png`

const image = (attrs: Record<string, unknown>): JSONContent => ({
  type: 'image',
  attrs,
})
const doc = (...content: JSONContent[]): JSONContent => ({
  type: 'doc',
  content,
})

describe('journal images', () => {
  it('stores a picture by its content name, with a description', () => {
    const content = doc(image({ imageId: IMAGE_ID, alt: 'A cat' }))
    expect(parseDocument(content)).toEqual(content)
  })

  it('rejects a picture named any other way', () => {
    for (const imageId of [
      'https://example.com/cat.gif',
      'blob:https://write.dhani.dev/1',
      `${'a'.repeat(64)}.svg`,
      null,
    ])
      expect(parseDocument(doc(image({ imageId, alt: '' })))).toBeNull()
  })

  it('reads the journal’s own pictures from HTML, and leaves out the web’s', () => {
    const editor = createTestEditor({
      extensions: documentExtensions,
      content: `<p>hi</p><img data-image-id="${IMAGE_ID}" alt="A cat"><img src="https://example.com/x.png">`,
    })
    const blocks = editor.getJSON().content ?? []
    expect(blocks.filter(({ type }) => type === 'image')).toEqual([
      image({ imageId: IMAGE_ID, alt: 'A cat' }),
    ])
  })

  it('links to its file in the images folder in markdown', () => {
    const editor = createTestEditor({
      extensions: [...documentExtensions, Markdown],
      content: doc(image({ imageId: IMAGE_ID, alt: 'A [big] cat' })),
    })
    expect(editor.getMarkdown().trim()).toBe(
      `![A \\[big\\] cat](images/${IMAGE_ID})`,
    )
  })

  it('collects every picture a document shows, once each', () => {
    const content = doc(
      image({ imageId: IMAGE_ID, alt: '' }),
      {
        type: 'blockquote',
        content: [image({ imageId: OTHER_IMAGE_ID, alt: '' })],
      },
      image({ imageId: IMAGE_ID, alt: 'again' }),
    )
    expect([...collectImageIds(content)]).toEqual([IMAGE_ID, OTHER_IMAGE_ID])
  })
})
