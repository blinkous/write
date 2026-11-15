import {
  getEntryText,
  getEntryTitle,
  summarizeEntry,
  type JournalEntry,
} from './journalEntry'

/** [start, end) positions in the original text. */
export type TextRange = readonly [number, number]

export type HighlightedText = { text: string; ranges: TextRange[] }

export type EntryMatch = {
  entry: JournalEntry
  title: HighlightedText
  /** Text around a match in the entry's body, when the name alone doesn't explain the match. */
  snippet: HighlightedText | null
}

/** Characters shown either side of a body match in a snippet. */
const SNIPPET_CONTEXT = 32
const ELLIPSIS = '…'

const COMBINING_MARKS = /\p{M}/gu

function normalizeCharacter(character: string): string {
  return character.normalize('NFKD').replace(COMBINING_MARKS, '').toLowerCase()
}

/**
 * Case- and accent-insensitive form of a text, plus where each of its
 * characters came from, so matches can be highlighted in the original.
 */
function normalizeWithPositions(text: string) {
  let normalized = ''
  const originalPositions: number[] = []
  let position = 0
  for (const character of text) {
    for (const normalizedCharacter of normalizeCharacter(character)) {
      normalized += normalizedCharacter
      originalPositions.push(position)
    }
    position += character.length
  }
  originalPositions.push(text.length)
  return { normalized, originalPositions }
}

/** Search words: normalized, deduplicated, empty ones dropped. */
export function parseSearchQuery(query: string): string[] {
  const words = normalizeWithPositions(query)
    .normalized.split(/\s+/)
    .filter(Boolean)
  return [...new Set(words)]
}

/** Every occurrence of every word, as merged ranges in the original text. */
function findRanges(text: string, words: readonly string[]): TextRange[] {
  const { normalized, originalPositions } = normalizeWithPositions(text)
  const ranges: [number, number][] = []
  for (const word of words) {
    for (
      let index = normalized.indexOf(word);
      index !== -1;
      index = normalized.indexOf(word, index + 1)
    ) {
      ranges.push([
        originalPositions[index],
        originalPositions[index + word.length],
      ])
    }
  }
  ranges.sort(([firstStart], [secondStart]) => firstStart - secondStart)
  return ranges.reduce<[number, number][]>((merged, range) => {
    const last = merged.at(-1)
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1])
    else merged.push([...range])
    return merged
  }, [])
}

function containsWord(text: string, word: string): boolean {
  return normalizeWithPositions(text).normalized.includes(word)
}

function buildSnippet(
  text: string,
  words: readonly string[],
): HighlightedText | null {
  const ranges = findRanges(text, words)
  const [firstRange] = ranges
  if (!firstRange) return null
  const start = Math.max(firstRange[0] - SNIPPET_CONTEXT, 0)
  const end = Math.min(firstRange[1] + SNIPPET_CONTEXT, text.length)
  const prefix = start > 0 ? ELLIPSIS : ''
  const suffix = end < text.length ? ELLIPSIS : ''
  const shift = prefix.length - start
  return {
    text: `${prefix}${text.slice(start, end)}${suffix}`,
    ranges: ranges
      .filter(
        ([rangeStart, rangeEnd]) => rangeStart >= start && rangeEnd <= end,
      )
      .map(([rangeStart, rangeEnd]): TextRange => [
        rangeStart + shift,
        rangeEnd + shift,
      ]),
  }
}

/**
 * Entries containing every word of the query in their name or text, in their
 * original order. An empty query matches everything, without highlights.
 */
export function searchEntries(
  entries: readonly JournalEntry[],
  query: string,
): EntryMatch[] {
  const words = parseSearchQuery(query)
  return entries.flatMap((entry): EntryMatch[] => {
    const titleText = getEntryTitle(summarizeEntry(entry)) ?? 'Untitled'
    if (words.length === 0)
      return [{ entry, title: { text: titleText, ranges: [] }, snippet: null }]
    const bodyText = getEntryText(entry)
    const isMatch = words.every(
      (word) => containsWord(titleText, word) || containsWord(bodyText, word),
    )
    if (!isMatch) return []
    const wordsOnlyInBody = words.filter(
      (word) => !containsWord(titleText, word),
    )
    return [
      {
        entry,
        title: { text: titleText, ranges: findRanges(titleText, words) },
        snippet:
          wordsOnlyInBody.length > 0
            ? buildSnippet(bodyText, wordsOnlyInBody)
            : null,
      },
    ]
  })
}
