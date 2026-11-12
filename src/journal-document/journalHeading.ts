import Heading from '@tiptap/extension-heading'
import { CONTENT_HEADING_LEVELS, toContentHeadingLevel } from './headingLevels'

/**
 * Headings for entry content: levels 2–6, since level 1 is the entry's title.
 * Typing `## ` … `###### ` makes that level and `# ` stays text. Pasted `#` /
 * `<h1>` headings become level 2 rather than being dropped.
 */
export const JournalHeading = Heading.extend({
  parseHTML() {
    return [1, 2, 3, 4, 5, 6].map((level) => ({
      tag: `h${level}`,
      attrs: { level: toContentHeadingLevel(level) },
    }))
  },

  parseMarkdown(token, helpers) {
    const level = toContentHeadingLevel(
      typeof token.depth === 'number' ? token.depth : 1,
    )
    return helpers.createNode(
      'heading',
      { level },
      helpers.parseInline(token.tokens ?? []),
    )
  },
}).configure({ levels: [...CONTENT_HEADING_LEVELS] })
