import type { JSONContent } from '@tiptap/react'
import { z } from 'zod'

export type JournalEntry = {
  id: string
  createdAt: string
  updatedAt: string
  /** Custom name. When null, the entry is named by its first line of text. */
  title: string | null
  /** Tiptap document JSON; lossless, and convertible to markdown on export. */
  content: JSONContent
}

const EMPTY_DOCUMENT: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

export function createJournalEntry(now = new Date()): JournalEntry {
  const timestamp = now.toISOString()
  return {
    id: crypto.randomUUID(),
    createdAt: timestamp,
    updatedAt: timestamp,
    title: null,
    content: EMPTY_DOCUMENT,
  }
}

function collectText({ text = '', content = [] }: JSONContent): string {
  return text + content.map(collectText).join('')
}

/** Text of each top-level block, trimmed, with empty blocks removed. */
function getBlockTexts({ content = [] }: JSONContent): string[] {
  return content.map((block) => collectText(block).trim()).filter(Boolean)
}

function getFirstLine({ content }: JournalEntry): string | null {
  const [firstBlockText] = getBlockTexts(content)
  return firstBlockText ?? null
}

export function getEntryTitle(entry: JournalEntry): string | null {
  return entry.title ?? getFirstLine(entry)
}

export const MAX_ENTRY_TITLE_LENGTH = 200

/** Trimmed, length-capped title; blank means "no custom title". */
function normalizeEntryTitle(rawTitle: string): string | null {
  const title = rawTitle.trim().slice(0, MAX_ENTRY_TITLE_LENGTH)
  return title === '' ? null : title
}

/**
 * The title to store after a rename. Accepting the first line unchanged keeps
 * the entry following its first line rather than freezing today's text.
 */
export function resolveRenamedTitle(
  entry: JournalEntry,
  rawTitle: string,
): string | null {
  const title = normalizeEntryTitle(rawTitle)
  return entry.title === null && title === getFirstLine(entry) ? null : title
}

/**
 * Lenient on purpose: a missing (older data) or malformed title becomes null
 * rather than rejecting the whole entry.
 */
export const entryTitleSchema = z
  .unknown()
  // Explicitly optional: in zod 4 a bare unknown() key is still required.
  .optional()
  .transform((value) =>
    typeof value === 'string' ? normalizeEntryTitle(value) : null,
  )

export function isEntryEmpty(entry: JournalEntry): boolean {
  return entry.title === null && getBlockTexts(entry.content).length === 0
}

export function sortEntriesNewestFirst(
  entries: readonly JournalEntry[],
): JournalEntry[] {
  return entries.toSorted((first, second) =>
    second.createdAt.localeCompare(first.createdAt),
  )
}
