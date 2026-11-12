const entryDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export function formatEntryDate(isoTimestamp: string): string {
  return entryDateFormatter.format(new Date(isoTimestamp))
}

const entryTimestampFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'full',
  timeStyle: 'short',
})

/** e.g. "Thursday, November 12, 2026 at 9:00 AM" (in the reader's locale). */
export function formatEntryTimestamp(isoTimestamp: string): string {
  return entryTimestampFormatter.format(new Date(isoTimestamp))
}
