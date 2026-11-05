const entryDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export function formatEntryDate(isoTimestamp: string): string {
  return entryDateFormatter.format(new Date(isoTimestamp))
}
