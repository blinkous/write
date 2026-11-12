import { z } from 'zod'
import { createDocumentComparer, parseDocument } from '../../journal-document'
import { migrateEntryFromFormat1 } from './entryMigration'
import {
  entryTitleSchema,
  reconcileTitleContent,
  getEntryTitle,
  type JournalEntry,
} from './journalEntry'

const EXPORT_FORMAT = 'write-journal'
/*
 * Version 2 reserves `#` headings for entry titles. Version 1 files are still
 * accepted and migrated on import, like stored entries.
 */
const EXPORT_VERSION = 2
const FORMAT_1_VERSION = 1

/** Large enough for years of writing, small enough not to freeze the tab. */
const MAX_IMPORT_FILE_BYTES = 20 * 1024 * 1024
const MAX_IMPORT_ENTRIES = 10_000
const MAX_ENTRY_ID_LENGTH = 100

export const JOURNAL_FILE_MIME_TYPE = 'application/json'

/* Content is validated separately against the document schema. */
const exportFileSchema = z.object({
  format: z.literal(EXPORT_FORMAT),
  version: z.union([z.literal(FORMAT_1_VERSION), z.literal(EXPORT_VERSION)]),
  entries: z
    .array(
      z.object({
        id: z.string().min(1).max(MAX_ENTRY_ID_LENGTH),
        createdAt: z.iso.datetime(),
        updatedAt: z.iso.datetime(),
        title: entryTitleSchema,
        titleContent: z.unknown().optional(),
        content: z.unknown(),
      }),
    )
    .max(MAX_IMPORT_ENTRIES),
})

export function serializeEntries(
  entries: readonly JournalEntry[],
  exportedAt = new Date(),
): string {
  const exportFile = {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt: exportedAt.toISOString(),
    entries,
  }
  return `${JSON.stringify(exportFile, null, 2)}\n`
}

type ParseResult =
  { ok: true; entries: JournalEntry[] } | { ok: false; reason: string }

/** Validates an export file. All-or-nothing: one bad entry rejects the whole file. */
export function parseEntriesFile(fileText: string): ParseResult {
  let rawFile: unknown
  try {
    rawFile = JSON.parse(fileText)
  } catch {
    return { ok: false, reason: 'The file isn’t valid JSON.' }
  }

  const fileResult = exportFileSchema.safeParse(rawFile)
  if (!fileResult.success)
    return { ok: false, reason: 'The file isn’t a journal export.' }

  const entries: JournalEntry[] = []
  for (const [entryIndex, rawEntry] of fileResult.data.entries.entries()) {
    const content = parseDocument(rawEntry.content)
    if (!content)
      return {
        ok: false,
        reason: `Entry ${entryIndex + 1} has invalid content.`,
      }
    const { titleContent, ...entry } = rawEntry
    entries.push({
      ...entry,
      titleContent: reconcileTitleContent(entry.title, titleContent),
      content,
    })
  }
  const isFormat1 = fileResult.data.version === FORMAT_1_VERSION
  return {
    ok: true,
    entries: isFormat1 ? entries.map(migrateEntryFromFormat1) : entries,
  }
}

export async function readEntriesFile(file: File): Promise<ParseResult> {
  if (file.size > MAX_IMPORT_FILE_BYTES)
    return { ok: false, reason: 'The file is too large.' }
  return parseEntriesFile(await file.text())
}

type ImportPlan = { entriesToAdd: JournalEntry[]; unchangedCount: number }

/**
 * Entries whose title and content already exist are left alone; anything else is added
 * as a new entry, never replacing one. Importing the same file twice is a no-op.
 */
export function planImport(
  existingEntries: readonly JournalEntry[],
  importedEntries: readonly JournalEntry[],
  createId: () => string = () => crypto.randomUUID(),
): ImportPlan {
  // An entry counts as already here only if both its title and content match.
  const comparersByTitle = new Map<
    string | null,
    ReturnType<typeof createDocumentComparer>
  >()
  function getComparer(title: string | null) {
    const existingComparer = comparersByTitle.get(title)
    if (existingComparer) return existingComparer
    const sameTitleContents = existingEntries
      .filter((entry) => entry.title === title)
      .map(({ content }) => content)
    const comparer = createDocumentComparer(sameTitleContents)
    comparersByTitle.set(title, comparer)
    return comparer
  }

  const takenIds = new Set(existingEntries.map(({ id }) => id))
  const entriesToAdd: JournalEntry[] = []

  for (const importedEntry of importedEntries) {
    const comparer = getComparer(importedEntry.title)
    if (comparer.hasEqual(importedEntry.content)) continue
    const id = takenIds.has(importedEntry.id) ? createId() : importedEntry.id
    entriesToAdd.push({ ...importedEntry, id })
    takenIds.add(id)
    comparer.add(importedEntry.content)
  }
  return {
    entriesToAdd,
    unchangedCount: importedEntries.length - entriesToAdd.length,
  }
}

export function describeImport({
  entriesToAdd,
  unchangedCount,
}: ImportPlan): string {
  const pluralize = (count: number) =>
    `${count} ${count === 1 ? 'entry' : 'entries'}`
  const parts = [
    entriesToAdd.length > 0
      ? `Imported ${pluralize(entriesToAdd.length)}`
      : 'Nothing new to import',
    unchangedCount > 0 ? `${pluralize(unchangedCount)} already here` : '',
  ]
  return `${parts.filter(Boolean).join(', ')}.`
}

function toFileNameSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

export function getEntryFileName(entry: JournalEntry): string {
  const datePart = entry.createdAt.slice(0, 10)
  const titleSlug = toFileNameSlug(getEntryTitle(entry) ?? '')
  return `journal-${datePart}${titleSlug ? `-${titleSlug}` : ''}.json`
}

export function getJournalFileName(exportedAt = new Date()): string {
  return `journal-all-${exportedAt.toISOString().slice(0, 10)}.json`
}
