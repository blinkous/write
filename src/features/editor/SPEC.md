# Editor

Rich-text writing surface for one entry, built on Tiptap (ProseMirror).

## How it works

- `useJournalEditor` creates a fresh editor whenever the entry id changes, so each entry
  has its own undo history. It reports every change as Tiptap JSON via `onChange`.
- The feature exports parts rather than one component (`FormattingToolbar`,
  `CopyMarkdownButton`, `JournalPage`) so the app can place the toolbar in its header.
- Extensions are defined once in `editorExtensions.ts` and shared with tests.
- Formatting toolbar buttons are data-driven from `formattingActions.ts`. Markdown
  shortcuts (`# `, `- `, `> `, `**bold**`) also work while typing.
- **Text color** (`TextColorPicker`) colors the selection, or the text about to be typed
  when nothing is selected. Closing the picker returns focus to the text so typing
  continues in that color. "Use page color" removes the override.
- **Text case** (`TextCasePicker`): UPPERCASE, lowercase, Title Case, Sentence case, or
  "As typed". Display-only: the letters typed are stored unchanged (see `journal-document`).
- **Copy as markdown** (icon button) serializes with `@tiptap/markdown` and writes to the
  clipboard, announcing "Copied" / "Copy failed" via a live region.

## Keyboard

- `⌥↑` / `⌥↓` move the current block (or all selected blocks) up/down, like VS Code
  (`moveBlocks.ts`). List items move as a whole. At the edge of a container nothing moves,
  unless the selection fills the container (e.g. a one-paragraph quote), in which case the
  container moves.
- Caret navigation (`⌘←/→`, `⌥←/→`, `⌘↑/↓`, with `⇧` to select) is native browser behaviour.
- `⌘B`, `⌘I`, `⌘Z`, `⌘⇧Z` come from Tiptap's StarterKit.

## Decisions

- Copied markdown and exports contain text as typed, not as displayed by text case.
- Markdown has no color syntax, so copied markdown drops text colors; JSON export keeps them.
- Content is stored as Tiptap JSON rather than markdown because it is lossless; markdown
  is produced on export.
