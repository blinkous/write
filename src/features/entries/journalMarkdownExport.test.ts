// @vitest-environment node
// (Zips are read back with fflate, which jsdom's arrays confuse; see zipFiles.test.)
import { strFromU8, unzipSync } from 'fflate'
import { storeImage } from '../../journal-images'
import { resetIndexedDb } from '../../test/resetIndexedDb'
import { createJournalEntry, type JournalEntry } from './journalEntry'
import {
  journalMarkdownExport,
  type ContentToMarkdown,
} from './journalMarkdown'

const EXPORTED_AT = new Date('2026-11-20T12:00:00.000Z')

/* Stands in for the editor's markdown: each picture's link, or the text. */
const contentToMarkdown: ContentToMarkdown = ({ content = [] }) =>
  content
    .map(({ type, attrs, content: inline = [] }) =>
      type === 'image'
        ? `![](images/${String(attrs?.imageId)})`
        : inline.map(({ text }) => text).join(''),
    )
    .join('\n\n')

function entryWith(...content: JournalEntry['content'][]): JournalEntry {
  return {
    ...createJournalEntry(EXPORTED_AT),
    content: { type: 'doc', content },
  }
}

const paragraph = (text: string) => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
})

describe('journalMarkdownExport', () => {
  beforeEach(() => resetIndexedDb())

  it('is one markdown file without pictures', () => {
    const file = journalMarkdownExport(
      [entryWith(paragraph('hello'))],
      contentToMarkdown,
      EXPORTED_AT,
    )
    expect(file).toMatchObject({
      suggestedName: 'journal-all-2026-11-20.md',
      mimeType: 'text/markdown',
      extension: '.md',
    })
    expect(file.contents).toContain('hello')
  })

  it('zips the markdown with the pictures it links to', async () => {
    const stored = await storeImage(
      new File(['cat'], 'cat.gif', { type: 'image/gif' }),
    )
    if (!stored.ok) throw new Error(stored.problem)
    const { imageId } = stored
    const file = journalMarkdownExport(
      [
        entryWith(paragraph('hello'), {
          type: 'image',
          attrs: { imageId, alt: '' },
        }),
      ],
      contentToMarkdown,
      EXPORTED_AT,
    )
    expect(file).toMatchObject({
      suggestedName: 'journal-all-2026-11-20.zip',
      mimeType: 'application/zip',
      extension: '.zip',
    })
    if (typeof file.contents !== 'function') throw new Error('not read later')
    const zip = await file.contents()
    if (typeof zip === 'string') throw new Error('not a zip')
    const files = unzipSync(new Uint8Array(await zip.arrayBuffer()))
    expect(Object.keys(files).toSorted()).toEqual([
      `images/${imageId}`,
      'journal-all-2026-11-20.md',
    ])
    expect(strFromU8(files['journal-all-2026-11-20.md'])).toContain(
      `![](images/${imageId})`,
    )
    expect(strFromU8(files[`images/${imageId}`])).toBe('cat')
  })
})
