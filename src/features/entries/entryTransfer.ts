import { z } from 'zod'
import { createDocumentComparer, parseDocument } from '../../journal-document'
import { isImageId } from '../../journal-images'
import { base64ToBytes } from '../../utils/base64'
import { migrateEntryFromFormat1 } from './entryMigration'
import {
  entryTitleSchema,
  reconcileTitleContent,
  getEntryTitle,
  summarizeEntry,
  type JournalEntry,
} from './journalEntry'

const EXPORT_FORMAT = 'write-journal'
/*
 * Version 2 reserves `#` headings for entry titles. Version 1 files are still
 * accepted and migrated on import, like stored entries.
 */
const EXPORT_VERSION = 2
const FORMAT_1_VERSION = 1

/* No cap on a file's size or entries: whatever the app exports, it can import. */
const MAX_ENTRY_ID_LENGTH = 100

export const JOURNAL_FILE_MIME_TYPE = 'application/json'

/* Content is validated separately against the document schema. */
const exportFileSchema = z.object({
  format: z.literal(EXPORT_FORMAT),
  version: z.union([z.literal(FORMAT_1_VERSION), z.literal(EXPORT_VERSION)]),
  entries: z.array(
    z.object({
      id: z.string().min(1).max(MAX_ENTRY_ID_LENGTH),
      createdAt: z.iso.datetime(),
      updatedAt: z.iso.datetime(),
      title: entryTitleSchema,
      titleContent: z.unknown().optional(),
      content: z.unknown(),
    }),
  ),
  /** The pictures the entries show, by content name, as base64 (checked against their names when restored). */
  images: z.record(z.string(), z.string()).optional(),
  /** Settings saved alongside (see serializeEntries); read by whoever imports settings. */
  settings: z.unknown().optional(),
})

type SerializeOptions = {
  exportedAt?: Date
  /**
   * Settings to save in the same file (opaque here: the settings feature
   * writes and reads them). Older versions of the app ignore them and still
   * import the entries.
   */
  settings?: unknown
  /** The entries' pictures, by content name, as base64 (see readEntryImages). */
  images?: Readonly<Record<string, string>>
}

export function serializeEntries(
  entries: readonly JournalEntry[],
  { exportedAt = new Date(), settings, images = {} }: SerializeOptions = {},
): string {
  const exportFile = {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt: exportedAt.toISOString(),
    entries,
    ...(Object.keys(images).length > 0 && { images }),
    ...(settings !== undefined && { settings }),
  }
  return `${JSON.stringify(exportFile, null, 2)}\n`
}

/** Pictures by content name, as read from a file (not yet checked against their names). */
export type ImportedImages = Map<string, Uint8Array<ArrayBuffer>>

type ParseResult =
  | {
      ok: true
      entries: JournalEntry[]
      images: ImportedImages
      settings?: unknown
    }
  | { ok: false; reason: string }

function parseImages(
  rawImages: Record<string, string> = {},
): ImportedImages | null {
  const images: ImportedImages = new Map()
  for (const [imageId, base64] of Object.entries(rawImages)) {
    const bytes = base64ToBytes(base64)
    if (!isImageId(imageId) || !bytes) return null
    images.set(imageId, bytes)
  }
  return images
}

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
  const images = parseImages(fileResult.data.images)
  if (!images) return { ok: false, reason: 'A picture in it is damaged.' }
  const isFormat1 = fileResult.data.version === FORMAT_1_VERSION
  return {
    ok: true,
    entries: isFormat1 ? entries.map(migrateEntryFromFormat1) : entries,
    images,
    settings: fileResult.data.settings,
  }
}

export async function readEntriesFile(file: File): Promise<ParseResult> {
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
  const titleSlug = toFileNameSlug(getEntryTitle(summarizeEntry(entry)) ?? '')
  return `journal-${datePart}${titleSlug ? `-${titleSlug}` : ''}.json`
}

export function getJournalFileName(exportedAt = new Date()): string {
  return `journal-all-${exportedAt.toISOString().slice(0, 10)}.json`
}
