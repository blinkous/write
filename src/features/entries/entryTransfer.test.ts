import { createJournalEntry, type JournalEntry } from './journalEntry'
import {
  describeImport,
  getEntryFileName,
  parseEntriesFile,
  planImport,
  serializeEntries,
} from './entryTransfer'

function createWrittenEntry(
  text: string,
  id: string = crypto.randomUUID(),
): JournalEntry {
  return {
    ...createJournalEntry(new Date('2026-11-05T09:00:00.000Z')),
    id,
    content: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
    },
  }
}

describe('serializeEntries / parseEntriesFile', () => {
  it('carries settings saved with the entries, untouched, and none otherwise', () => {
    const settings = { format: 'write-settings', version: 1 }
    const entries = [createWrittenEntry('with settings')]
    expect(
      parseEntriesFile(serializeEntries(entries, { settings })),
    ).toMatchObject({ ok: true, settings })
    expect('settings' in JSON.parse(serializeEntries(entries))).toBe(false)
  })

  it('carries the entries’ pictures, and none when there are none', () => {
    const imageId = `${'a'.repeat(64)}.gif`
    const entries = [createWrittenEntry('with a picture')]
    const result = parseEntriesFile(
      serializeEntries(entries, { images: { [imageId]: 'Y2F0' } }),
    )
    const images = result.ok ? [...result.images] : []
    expect(
      images.map(([id, bytes]) => [id, new TextDecoder().decode(bytes)]),
    ).toEqual([[imageId, 'cat']])
    expect('images' in JSON.parse(serializeEntries(entries))).toBe(false)
  })

  it('rejects a file with a damaged or misnamed picture', () => {
    const entries = [createWrittenEntry('with a picture')]
    for (const images of [
      { [`${'a'.repeat(64)}.gif`]: 'not base64!' },
      { 'https://example.com/cat.gif': 'Y2F0' },
    ])
      expect(parseEntriesFile(serializeEntries(entries, { images }))).toEqual({
        ok: false,
        reason: 'A picture in it is damaged.',
      })
  })

  it('round-trips entries', () => {
    const entries = [createWrittenEntry('one'), createWrittenEntry('two')]
    const result = parseEntriesFile(serializeEntries(entries))
    // Validation fills in schema defaults (e.g. paragraph size), so compare content, not exact JSON.
    expect(result).toMatchObject({ ok: true, entries })
  })

  it('keeps small paragraphs through export and import', () => {
    const entry = {
      ...createWrittenEntry('unused'),
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { size: 'small' },
            content: [{ type: 'text', text: 'a note' }],
          },
        ],
      },
    }
    const result = parseEntriesFile(serializeEntries([entry]))
    expect(result.ok && result.entries[0].content.content?.[0].attrs).toEqual({
      size: 'small',
      alignment: null,
    })
  })

  it('rejects malformed JSON, other files, and invalid content', () => {
    expect(parseEntriesFile('{oops')).toMatchObject({ ok: false })
    expect(parseEntriesFile('{"entries": []}')).toMatchObject({ ok: false })
    const badContent = serializeEntries([createWrittenEntry('fine')]).replace(
      '"paragraph"',
      '"script"',
    )
    expect(parseEntriesFile(badContent)).toEqual({
      ok: false,
      reason: 'Entry 1 has invalid content.',
    })
  })

  it('does not let extra keys through', () => {
    const file = JSON.parse(serializeEntries([createWrittenEntry('hi')]))
    file.entries[0].__proto__ = { polluted: true }
    file.entries[0].extra = 'x'
    const result = parseEntriesFile(JSON.stringify(file))
    expect(result.ok && Object.keys(result.entries[0]).sort()).toEqual([
      'content',
      'createdAt',
      'id',
      'title',
      'titleContent',
      'updatedAt',
    ])
  })
})

describe('planImport', () => {
  it('skips entries whose content already exists, whatever their id', () => {
    const existing = [createWrittenEntry('same', 'local-id')]
    const plan = planImport(existing, [createWrittenEntry('same', 'other-id')])
    expect(plan).toEqual({ entriesToAdd: [], unchangedCount: 1 })
  })

  it('adds changed content as a new entry instead of replacing', () => {
    const existing = [createWrittenEntry('original', 'shared-id')]
    const plan = planImport(
      existing,
      [createWrittenEntry('edited', 'shared-id')],
      () => 'new-id',
    )
    expect(plan.entriesToAdd.map(({ id }) => id)).toEqual(['new-id'])
  })

  it('is idempotent: re-importing after an import adds nothing', () => {
    const existing = [createWrittenEntry('original', 'shared-id')]
    const imported = [
      createWrittenEntry('edited', 'shared-id'),
      createWrittenEntry('brand new'),
    ]
    const firstPlan = planImport(existing, imported)
    const secondPlan = planImport(
      [...existing, ...firstPlan.entriesToAdd],
      imported,
    )
    expect(firstPlan.entriesToAdd).toHaveLength(2)
    expect(secondPlan.entriesToAdd).toHaveLength(0)
  })

  it('does not add duplicates that appear twice in the same file', () => {
    const plan = planImport(
      [],
      [createWrittenEntry('twice'), createWrittenEntry('twice')],
    )
    expect(plan.entriesToAdd).toHaveLength(1)
  })
})

describe('planImport with titles', () => {
  it('adds an entry whose content matches but whose title differs', () => {
    const existing = [createWrittenEntry('same')]
    const renamed = { ...createWrittenEntry('same'), title: 'Renamed' }
    expect(planImport(existing, [renamed]).entriesToAdd).toHaveLength(1)
  })

  it('reads exports made before titles existed', () => {
    const file = JSON.parse(serializeEntries([createWrittenEntry('old')]))
    delete file.entries[0].title
    const result = parseEntriesFile(JSON.stringify(file))
    expect(result.ok && result.entries[0].title).toBeNull()
  })
})

describe('describeImport', () => {
  it('summarizes what happened', () => {
    expect(
      describeImport({
        entriesToAdd: [createWrittenEntry('a')],
        unchangedCount: 2,
      }),
    ).toBe('Imported 1 entry, 2 entries already here.')
    expect(describeImport({ entriesToAdd: [], unchangedCount: 1 })).toBe(
      'Nothing new to import, 1 entry already here.',
    )
  })
})

describe('getEntryFileName', () => {
  it('uses the date and a safe slug of the title', () => {
    expect(getEntryFileName(createWrittenEntry('Rain & ../../soup!'))).toBe(
      'journal-2026-11-05-rain-soup.json',
    )
  })
})

describe('importing older backups', () => {
  it('migrates version 1 files: a leading # heading becomes the title', () => {
    const file = JSON.parse(serializeEntries([createWrittenEntry('unused')]))
    file.version = 1
    file.entries[0].content = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Sunday' }],
        },
        { type: 'paragraph', content: [{ type: 'text', text: 'Rain.' }] },
      ],
    }
    const result = parseEntriesFile(JSON.stringify(file))
    expect(result.ok && result.entries[0].title).toBe('Sunday')
    expect(
      result.ok && result.entries[0].content.content?.map(({ type }) => type),
    ).toEqual(['paragraph'])
  })

  it('exports as version 2', () => {
    expect(JSON.parse(serializeEntries([])).version).toBe(2)
  })
})
