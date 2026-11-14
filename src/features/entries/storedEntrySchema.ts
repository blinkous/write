import type { JSONContent } from '@tiptap/react'
import { z } from 'zod'
import { entryTitleSchema, reconcileTitleContent } from './journalEntry'

function isDocumentContent(value: unknown): value is JSONContent {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'doc'
  )
}

/** A saved entry, wherever it's stored (IndexedDB, or localStorage before the move). */
export const storedEntrySchema = z
  .object({
    id: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    title: entryTitleSchema,
    titleContent: z.unknown().optional(),
    content: z.custom<JSONContent>(isDocumentContent),
  })
  // Styling that's invalid or no longer matches the title is dropped, keeping the title.
  .transform(({ titleContent, ...entry }) => ({
    ...entry,
    titleContent: reconcileTitleContent(entry.title, titleContent),
  }))

export const storedEntriesSchema = z.array(storedEntrySchema)
