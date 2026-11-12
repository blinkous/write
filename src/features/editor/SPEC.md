# Editor

Rich-text writing surface for one entry, built on Tiptap (ProseMirror).

## How it works

- `useJournalEditor` creates a fresh editor whenever the entry id changes, so each entry
  has its own undo history. It reports every change as Tiptap JSON via `onChange`.
- The feature exports parts rather than one component (`FormattingToolbar`,
  `JournalPage`, pickers, `copyEditorMarkdown`) so the app can arrange them.
- Extensions are defined once in `editorExtensions.ts` and shared with tests.
- Formatting toolbar buttons are data-driven from `formattingActions.ts`. Markdown
  shortcuts (`# `, `- `, `> `, `**bold**`) also work while typing.
- **Text styles** (`TextStyleMenu`, `textStyles.ts`) mirror markdown: Small, Body, Heading
  1–3. Headings survive Copy as markdown; Small copies as a plain paragraph (markdown has no
  small text). The toolbar shows only the current style's icon (T, ¶, H1, H2, H3); the menu repeats that icon beside each spelled-out name,
  previewed at its size (`--scale-heading-*` tokens, shared with the editor). ⌘⇧> / ⌘⇧<
  step Small → Body → H3 → H2 → H1 and back, stopping at the ends. Enter after a heading or
  Small paragraph starts a Body one. Body text is a fixed 16 px
  (`--font-size-editor`); overall size is left to browser zoom.
- **Text color** (`TextColorPicker`) colors the selection, or the text about to be typed
  when nothing is selected. Closing the menu returns focus to the text so typing
  continues in that color. The menu has (no titles; rows have accessible names):
  - **Theme row:** the page text color, then six live tones of the page background, light
    to dark (see `journal-document`); clicking one applies it and closes the menu. The first
    tile removes the text's own color (so it doubles as reset) and is selected by default.
  - **Custom row:** seven saved slots (stored with appearance). An empty slot (dashed)
    opens the color picker; picking fills the slot and applies it. A filled slot applies
    its color on click and can be re-picked; hovering or focusing it shows a small × to
    empty it. Text already colored keeps its color (the color is stored on the text).
- **Text case** (`TextCasePicker`): UPPERCASE, lowercase, Title Case, Sentence case, or
  "As typed". Display-only: the letters typed are stored unchanged (see `journal-document`).
- **Copy as markdown** (`copyEditorMarkdown`, in the entry ⋯ menu) serializes with
  `@tiptap/markdown` and writes to the clipboard; the app confirms with a toast.

## Keyboard

- `⌥↑` / `⌥↓` move the current block (or all selected blocks) up/down, like VS Code
  (`moveBlocks.ts`). List items move as a whole. At the edge of a container nothing moves,
  unless the selection fills the container (e.g. a one-paragraph quote), in which case the
  container moves.
- Caret navigation (`⌘←/→`, `⌥←/→`, `⌘↑/↓`, with `⇧` to select) is native browser behaviour.
- `⌘B`, `⌘I`, `⌘Z`, `⌘⇧Z` come from Tiptap's StarterKit.
- `⌘⇧>` / `⌘⇧<` step the current paragraph's text style up / down (`textStyleShortcuts.ts`).
  `⌘⇧+` is left to the browser, where it zooms the page.
- **Tab** inserts a tab (shown 4 spaces wide, `--tab-size`); **Shift+Tab** removes one from
  the start of the line. In lists, Tab/Shift+Tab indent and outdent the item instead
  (`TabIndent` has lower priority than list keymaps). To avoid a keyboard trap,
  **Escape then Tab** moves focus out as usual; a hidden hint linked via
  `aria-describedby` says so.

## Decisions

- **Title in markdown:** when the entry has a custom name, Copy as markdown puts it first as
  the one `#` heading and moves the content's headings down a level (Heading 1 → `##`), like
  Notion's page title above Heading 1. A name taken from the first line isn't added (it would
  duplicate that line), so that content copies as written.
- Copied markdown and exports contain text as typed, not as displayed by text case.
- Markdown export is checked by round-trip tests (`markdownRoundTrip.test.ts`): export, read
  back as markdown, and structure and text must match. Paragraph text that looks like
  markdown (`# `, `1. `, `- `, `---`, fences, 4-space indents) is escaped so it stays text.
- Markdown has no color syntax, so copied markdown drops text colors; JSON export keeps them.
- Copied markdown turns tabs into two em spaces (outside fenced code), because a leading
  tab or spaces in markdown makes an indented code block. JSON keeps the real tabs.
- The editor carries opt-out markers for Grammarly and LanguageTool (`data-gramm`,
  `data-lt-active`, …) so well-behaved writing assistants don't read or send journal text.
  They can't stop a malicious extension (see the privacy feature).
- Content is stored as Tiptap JSON rather than markdown because it is lossless; markdown
  is produced on export.
