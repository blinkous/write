# Journal document

The shape of a journal entry's content, shared by the editor (which edits it) and entries
(which stores, imports and exports it).

## How it works

- `documentExtensions` defines the schema: StarterKit (paragraphs, headings, lists, quotes,
  code, links, bold/italic/etc.) plus per-text color, text case, and a paragraph `size`
  attribute (`small`, rendered as `data-size`; copies to markdown as a plain paragraph).
- Headings are `JournalHeading`, levels 2–6: level 1 is the entry's title, which lives outside
  the document (`headingLevels.ts`). Pasted `#` / `<h1>` headings become level 2.
- Paragraphs are `MarkdownSafeParagraph`: markdown structure at the start of any line of
  paragraph text (headings, bullets, numbered items, rules, fences, 4-space indents) is
  escaped on export, so text stays text when pasted into a markdown app.
- `parseDocument` validates untrusted JSON (e.g. an import) against the schema and returns
  a clean copy, or null. Unknown node/mark types are rejected; unknown attributes dropped.
- `createDocumentComparer` checks content equality (including formatting) using
  ProseMirror's node equality, so key order and other JSON noise don't matter.

## Text color

- Text with no color mark inherits the page text color (`--color-text`), so changing the
  page color later recolors it automatically. A color mark overrides it for that text.
- A color mark stores either a hex color or a theme name (`theme-1`…`theme-7`). Theme
  names render as `var(--color-theme-N)`, cozy shades derived from the page background by
  the appearance feature, so theme-colored text follows background changes. `resolveTextColor`
  accepts only these two forms; anything else (e.g. from an import) is ignored.
- Colors are applied through a mark view using the CSSOM (`element.style.color`), because
  the app's CSP blocks inline `style` attributes, which is how Tiptap renders them by default.

## Text case

- A `textCase` mark (`upper`, `lower`, `title`, `sentence`) changes only how text displays;
  the stored letters stay as typed. It is inclusive, so typing inside it continues the case.
- Upper/lower are plain CSS `text-transform`. CSS can't do title or sentence case, so the
  mark displays lowercase and a plugin adds `CAPITAL_LETTER_CLASS` decorations to letters
  that start a word (title) or a sentence (sentence), computed per block by
  `findCapitalOffsets`. Sentences end at `.`, `!`, `?` or `…` followed by whitespace; a
  number right after a period (e.g. `3.50`) doesn't end one.
