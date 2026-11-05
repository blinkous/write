# Journal document

The shape of a journal entry's content, shared by the editor (which edits it) and entries
(which stores, imports and exports it).

## How it works

- `documentExtensions` defines the schema: StarterKit (paragraphs, headings, lists, quotes,
  code, links, bold/italic/etc.) plus per-text color and text case.
- `parseDocument` validates untrusted JSON (e.g. an import) against the schema and returns
  a clean copy, or null. Unknown node/mark types are rejected; unknown attributes dropped.
- `createDocumentComparer` checks content equality (including formatting) using
  ProseMirror's node equality, so key order and other JSON noise don't matter.

## Text color

- Text with no color mark inherits the page text color (`--color-text`), so changing the
  page color later recolors it automatically. A color mark overrides it for that text.
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
