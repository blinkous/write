import type { JSONContent } from '@tiptap/react'
import { z } from 'zod'
import { parseTitleContent } from '../../journal-document'

export type JournalEntry = {
  id: string
  createdAt: string
  updatedAt: string
  /** Custom name. When null, the entry is named by its first line of text. */
  title: string | null
  /**
   * The title's styling (fonts, colors, bold…) as a one-line title document.
   * Null when the title is plain; its text always matches `title`.
   */
  titleContent: JSONContent | null
  /** Tiptap document JSON; lossless, and convertible to markdown on export. */
  content: JSONContent
}

/**
 * What the list and the rest of the app know about an entry: everything but
 * its writing, plus the first line it's named by when untitled. The writing
 * itself stays in storage (and in the editor while it's open).
 */
export type EntrySummary = Omit<JournalEntry, 'content'> & {
  firstLine: string | null
}

/** Changes to a stored entry; the rest of it stays as it is. */
export type EntryChanges = Partial<Omit<JournalEntry, 'id' | 'createdAt'>>

/** Just enough to name an entry. */
type EntryName = Pick<EntrySummary, 'title' | 'firstLine'>

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
    titleContent: null,
    content: EMPTY_DOCUMENT,
  }
}

/** A title as a title document, keeping its styling when it has any. */
export function getTitleDocument({
  title,
  titleContent,
}: Pick<JournalEntry, 'title' | 'titleContent'>): JSONContent {
  if (titleContent) return titleContent
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: title ? [{ type: 'text', text: title }] : [],
      },
    ],
  }
}

function hasMarks({ marks = [], content = [] }: JSONContent): boolean {
  return marks.length > 0 || content.some(hasMarks)
}

/**
 * What to store for a title typed on the page: its text as the title, and its
 * document only if something is styled (a plain title is just its text).
 */
export function readTitleDocument(
  titleDocument: JSONContent,
): Pick<JournalEntry, 'title' | 'titleContent'> {
  const title = normalizeEntryTitle(collectText(titleDocument))
  return {
    title,
    titleContent:
      title !== null && hasMarks(titleDocument) ? titleDocument : null,
  }
}

/** Keeps stored title styling only if it's valid and still matches the title's text. */
export function reconcileTitleContent(
  title: string | null,
  rawTitleContent: unknown,
): JSONContent | null {
  const titleContent = parseTitleContent(rawTitleContent)
  return titleContent &&
    title !== null &&
    normalizeEntryTitle(collectText(titleContent)) === title
    ? titleContent
    : null
}

function collectText({ text = '', content = [] }: JSONContent): string {
  return text + content.map(collectText).join('')
}

/** Text of each top-level block, trimmed, with empty blocks removed. */
function getBlockTexts({ content = [] }: JSONContent): string[] {
  return content.map((block) => collectText(block).trim()).filter(Boolean)
}

/** All of an entry's text, one space between blocks, for searching. */
export function getEntryText({ content }: JournalEntry): string {
  return getBlockTexts(content).join(' ')
}

/** The first line of text, which names an untitled entry. */
export function getFirstLine(content: JSONContent): string | null {
  const [firstBlockText] = getBlockTexts(content)
  return firstBlockText ?? null
}

export function summarizeEntry({
  content,
  ...fields
}: JournalEntry): EntrySummary {
  return { ...fields, firstLine: getFirstLine(content) }
}

export function getEntryTitle({ title, firstLine }: EntryName): string | null {
  return title ?? firstLine
}

export const MAX_ENTRY_TITLE_LENGTH = 200

/** Trimmed, length-capped title; blank means "no custom title". */
export function normalizeEntryTitle(rawTitle: string): string | null {
  const title = rawTitle.trim().slice(0, MAX_ENTRY_TITLE_LENGTH)
  return title === '' ? null : title
}

/**
 * The title to store after a rename. Accepting the first line unchanged keeps
 * the entry following its first line rather than freezing today's text.
 */
export function resolveRenamedTitle(
  entry: EntryName,
  rawTitle: string,
): string | null {
  const title = normalizeEntryTitle(rawTitle)
  return entry.title === null && title === entry.firstLine ? null : title
}

/**
 * A rename from the sidebar: plain text, so styling is kept only if the text
 * didn't change.
 */
export function renameEntryTitle(
  entry: Pick<EntrySummary, 'title' | 'titleContent' | 'firstLine'>,
  rawTitle: string,
): Pick<JournalEntry, 'title' | 'titleContent'> {
  const title = resolveRenamedTitle(entry, rawTitle)
  return {
    title,
    titleContent: title === entry.title ? entry.titleContent : null,
  }
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

/** No name and no text. */
export function isEntryEmpty({ title, firstLine }: EntryName): boolean {
  return title === null && firstLine === null
}
