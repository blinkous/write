# Journal document

The shape of an entry's content, shared by the editor (which edits it) and entries (which
stores, imports and exports it).

## What it holds

- Paragraphs, headings 2–6, lists, quotes, code and links, with bold, italic, underline,
  strikethrough, plus per-text color, font, glow, letter spacing and case, and Small
  paragraphs (plain paragraphs in markdown).
- **Heading 1 is the entry's title**, which lives outside the document. Pasted `#` headings
  become level 2.

## Rules

- **Untrusted content is rebuilt from the schema:** unknown nodes and marks reject it,
  unknown attributes are dropped, and values outside their allowed forms are ignored.
- **Equality includes formatting** and ignores JSON noise like key order (used to skip
  duplicate imports).
- **Markdown stays text:** paragraph text that looks like markdown at a line start (`# `,
  `- `, `1. `, `---`, fences, 4-space indents) is escaped on export.
- **Colors and glows** are a hex color or a theme name (`theme-1`…`theme-7`). Theme names
  follow the page background, so theme-colored text changes with it. Text without a color
  follows the page text color. A glow can also be "none", to turn off its style's glow.
  Glow and color are independent.
- **Letter spacing** is a whole percent of the text's size (−5 to 30), so it scales with it.
- **Text can turn off emphasis its style gives** (not bold, not italic, no underline, no
  strike; dropped from markdown, which can't say "not bold"). Toggling acts on what's shown,
  so a text's own mark and its "off" never overlap.
- **Case is display-only:** the letters stay as typed. Upper and lower are CSS; title and
  sentence case are drawn by capitalizing letters. Sentences end at `.`, `!`, `?` or `…`
  followed by whitespace (`3.50` doesn't end one). Text's own case wins over its style's;
  code keeps its letters.

## Decisions

- Colors, fonts and glows are applied through the DOM rather than inline `style`
  attributes, which the CSP blocks.
- A style's underline and strikethrough are drawn per text rather than on the block,
  because a line the block draws can't be undone for text inside it. Like capitals, they
  redraw only the blocks an edit touched.
