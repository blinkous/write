import styles from './HighlightedText.module.css'

type HighlightedTextProps = {
  text: string
  /** Sorted, non-overlapping [start, end) ranges to highlight. */
  ranges: readonly (readonly [number, number])[]
}

/** Text with parts marked, e.g. search matches. */
export function HighlightedText({ text, ranges }: HighlightedTextProps) {
  const parts: { text: string; isMatch: boolean }[] = []
  let position = 0
  for (const [start, end] of ranges) {
    if (start > position)
      parts.push({ text: text.slice(position, start), isMatch: false })
    parts.push({ text: text.slice(start, end), isMatch: true })
    position = end
  }
  if (position < text.length)
    parts.push({ text: text.slice(position), isMatch: false })
  return (
    <>
      {parts.map((part, index) =>
        part.isMatch ? (
          // Parts never reorder, so the index is a stable key.
          <mark key={index} className={styles.match}>
            {part.text}
          </mark>
        ) : (
          part.text
        ),
      )}
    </>
  )
}
