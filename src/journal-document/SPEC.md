# Journal document

The shape of a journal entry's content, shared by the editor (which edits it) and entries
(which stores, imports and exports it).

## How it works

- `documentExtensions` defines the schema: StarterKit (paragraphs, headings, lists, quotes,
  code, links, bold/italic/etc.) plus per-text color, font, glow and letter spacing (`textStyleMark.ts`), text case, and a paragraph `size`
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

## Text glow

- A glow is stored on the text style mark (`glow`, like color and font) as a hex color or a
  theme name, the same forms as text color, or `none` (no glow where its text style has
  one, `NO_GLOW`); anything else is ignored. It renders as stacked
  `text-shadow`s (`resolveTextGlow`), blur radii in em so it scales with the text (tight layers stacked for a
  bright neon halo, then a wide bloom), set through
  the same CSP-safe mark view (`textStyleMark.ts`) as color and font. Glow and color are
  independent: changing one never changes the other.

## Text letter spacing

- Stored on the text style mark (`letterSpacing`) as a whole percent of the text's size,
  within `LETTER_SPACING_RANGE` (−5 to 30, shared with text styles); anything else is
  ignored. Rendered as em through the same mark view, so it scales with the text.

## Text emphasis

- Text can turn off the bold, italic, underline or strikethrough its text style gives it:
  `noBold`, `noItalic`, `noUnderline`, `noStrike` on the text style mark (`data-no-bold` and
  so on in HTML; dropped from markdown, which can't say "not bold"). `toggleEmphasis` acts on
  what's shown: shown emphasis turns off (its own mark removed, plus an off where its style
  has it), hidden emphasis turns on (the off removed, plus its own mark where its style lacks
  it), so a text's own mark and its off never overlap. `isEmphasisShown` is what the toolbar
  shows as pressed. ⌘B, ⌘I, ⌘U and ⇧⌘X run `toggleEmphasis` too (the extension's shortcuts
  come before the marks').
- Blocks get their style's emphasis from `setBlockEmphasis` (storage, like block cases).
  Not bold and not italic render through the mark view (`font-weight` / `font-style:
normal`). A style's underline and strikethrough are drawn on its text as decorations
  (`style-underline`, `style-strike`), skipping text that turned them off, because lines a
  block draws reach all its text and can't be undone inside it. Like capitals, they redraw
  only the blocks an edit touched (`changedRanges.ts`).

## Text case

- A `textCase` mark (`upper`, `lower`, `title`, `sentence`, or `as-typed` for the letters as
  typed where its text style has a case) changes only how text displays;
  the stored letters stay as typed. It is inclusive, so typing inside it continues the case.
- Upper/lower are plain CSS `text-transform`. CSS can't do title or sentence case, so the
  mark displays lowercase and a plugin adds `CAPITAL_LETTER_CLASS` decorations to letters
  that start a word (title) or a sentence (sentence), computed per block by
  `findCapitalOffsets`. Sentences end at `.`, `!`, `?` or `…` followed by whitespace; a
  number right after a period (e.g. `3.50`) doesn't end one.
- A whole block can also take a case from its text style: the editor app passes
  `setBlockTextCases` a function from block to case, kept in the mark's storage, and the
  command redraws every block's capitals (not an undo step). Text's own case wins over its
  block's; code keeps its letters as typed.
