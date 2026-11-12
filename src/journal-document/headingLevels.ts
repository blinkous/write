import type { JSONContent } from '@tiptap/core'

/** `#` is the entry's title (shown above the page); content headings use the rest. */
export const TITLE_HEADING_LEVEL = 1
export const CONTENT_HEADING_LEVELS = [2, 3, 4, 5, 6] as const
export type ContentHeadingLevel = (typeof CONTENT_HEADING_LEVELS)[number]

const [TOP_CONTENT_LEVEL] = CONTENT_HEADING_LEVELS
const DEEPEST_LEVEL = CONTENT_HEADING_LEVELS[CONTENT_HEADING_LEVELS.length - 1]

/** A heading level that content may use: `#` content becomes the top content level. */
export function toContentHeadingLevel(level: number): ContentHeadingLevel {
  const clamped = Math.min(
    Math.max(Math.round(level), TOP_CONTENT_LEVEL),
    DEEPEST_LEVEL,
  )
  return (
    CONTENT_HEADING_LEVELS.find((contentLevel) => contentLevel === clamped) ??
    TOP_CONTENT_LEVEL
  )
}

/** Moves every heading one level down (h1 → h2 …), stopping at h6. */
export function shiftHeadingsDown(node: JSONContent): JSONContent {
  const { type, attrs, content } = node
  const shifted = content
    ? { ...node, content: content.map(shiftHeadingsDown) }
    : node
  if (type !== 'heading') return shifted
  const level =
    typeof attrs?.level === 'number' ? attrs.level : TITLE_HEADING_LEVEL
  return {
    ...shifted,
    attrs: { ...attrs, level: Math.min(level + 1, DEEPEST_LEVEL) },
  }
}
