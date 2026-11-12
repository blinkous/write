import Paragraph from '@tiptap/extension-paragraph'

/*
 * Line starts that markdown would read as structure rather than text. Each
 * pattern's first group is the leading indent, kept as is; the escape goes
 * right after it.
 */
const STRUCTURE_AT_LINE_START: readonly RegExp[] = [
  /^( {0,3})(#{1,6})(?=\s|$)/, // heading
  /^( {0,3})([-+])(?=\s|$)/, // bullet ("*" is already escaped as text)
  /^( {0,3})(\d{1,9})([.)])(?=\s|$)/, // numbered item: escape the "." or ")"
  /^( {0,3})(`{3,}|~{3,})/, // code fence
  /^( {0,3})([-_=])\s*(?:\2\s*)+$/, // horizontal rule or underline heading
]

/* Four or more leading spaces make an indented code block. */
const CODE_INDENT = /^ {4,}/
const NO_BREAK_SPACE = ' '

function escapeLineStart(line: string): string {
  if (CODE_INDENT.test(line)) {
    // Non-breaking spaces keep the indent visible without starting a code block.
    return line.replace(CODE_INDENT, (spaces) =>
      NO_BREAK_SPACE.repeat(spaces.length),
    )
  }
  for (const pattern of STRUCTURE_AT_LINE_START) {
    const match = line.match(pattern)
    if (!match) continue
    const [, indent, marker, numberedDelimiter] = match
    // A backslash before the marker, or before the "." / ")" of a numbered item.
    const escapeAt = indent.length + (numberedDelimiter ? marker.length : 0)
    return `${line.slice(0, escapeAt)}\\${line.slice(escapeAt)}`
  }
  return line
}

/**
 * Escapes markdown structure at the start of each line of a paragraph's
 * markdown, so text like "# not a heading" or "1. not a list" stays text when
 * the markdown is pasted elsewhere.
 */
export function escapeParagraphLineStarts(markdown: string): string {
  return markdown.split('\n').map(escapeLineStart).join('\n')
}

/** The standard paragraph, with markdown that can't be misread as other structure. */
export const MarkdownSafeParagraph = Paragraph.extend({
  renderMarkdown(node, helpers, context) {
    const markdown = this.parent?.(node, helpers, context) ?? ''
    return escapeParagraphLineStarts(markdown)
  },
})
