import { z } from 'zod'
import { readStoredValue, writeStoredValue } from '../../lib/localStore'

/* What the Export dialog saves, remembered for next time. */
const EXPORT_CHOICES_STORAGE_KEY = 'write.exportChoices.v1'

const exportChoicesSchema = z.object({
  includesJournal: z.boolean(),
  includesSettings: z.boolean(),
  format: z.enum(['json', 'markdown']),
})

export type ExportChoices = z.infer<typeof exportChoicesSchema>
export type ExportFormat = ExportChoices['format']

/** Everything, as JSON: a full backup. */
const DEFAULT_EXPORT_CHOICES: ExportChoices = {
  includesJournal: true,
  includesSettings: true,
  format: 'json',
}

/** Markdown is for reading the writing elsewhere, so it holds only the journal; settings need JSON. */
export function canIncludeSettings(format: ExportFormat): boolean {
  return format === 'json'
}

/** What would actually be saved: settings only where the format allows them. */
export function getExportContents({
  includesJournal,
  includesSettings,
  format,
}: ExportChoices) {
  return {
    includesJournal,
    includesSettings: includesSettings && canIncludeSettings(format),
  }
}

export function canExport(choices: ExportChoices): boolean {
  const { includesJournal, includesSettings } = getExportContents(choices)
  return includesJournal || includesSettings
}

export function loadExportChoices(): ExportChoices {
  return readStoredValue(
    EXPORT_CHOICES_STORAGE_KEY,
    exportChoicesSchema,
    DEFAULT_EXPORT_CHOICES,
  )
}

export function saveExportChoices(choices: ExportChoices): void {
  writeStoredValue(EXPORT_CHOICES_STORAGE_KEY, choices)
}
