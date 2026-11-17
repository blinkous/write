# Editor

Rich-text writing surface for one entry, built on Tiptap (ProseMirror).

## How it works

- `useJournalEditor` creates a fresh editor whenever the entry id changes, so each entry
  has its own undo history. It reports every change as Tiptap JSON via `onChange`.
- The feature exports parts rather than one component (`FormattingButtons`,
  `JournalPage`, pickers, `documentToMarkdown`) so the app can arrange them.
- **The toolbar goes from the letters out**, in three groups split by dividers: **Text**
  (font, letter spacing, case, color, glow, then bold, italic, underline, strikethrough,
  code), **Structure** (text style, bulleted and numbered lists, quote, code block), then
  **Page** (margins, spacing). Text styles in settings list their options in the text
  group's order.
- Extensions are defined once in `editorExtensions.ts` and shared with tests.
- Formatting toolbar buttons are data-driven from `formattingActions.ts`
  (`TEXT_FORMATTING_ACTIONS`, `STRUCTURE_FORMATTING_ACTIONS`). Markdown
  shortcuts (`# `, `- `, `> `, `**bold**`) also work while typing.
- **Text styles** (`TextStyleMenu`, `textStyles.ts`) mirror markdown: Small, Body, Heading
  2–6 (`##`–`######`). Heading 1 / `#` is the entry's title (shown above the page), so it
  isn't a content style: typing `# ` stays text, `## ` … `###### ` make that level, and pasted
  `#` headings become H2 (`journal-document/journalHeading.ts`). Small copies to markdown as a
  plain paragraph. The toolbar shows only the current style's icon; the menu repeats it beside
  each name, previewed in its style (the `--text-style-*` variables, scaled relative to body).
  ⇧⌘> / ⇧⌘< step Small → Body → H6 … H2 and back, stopping at the ends. How each style looks
  (size, weight, font, color, glow) is set in settings → Editor (`src/text-styles`).
- **Text font** (`TextFontMenu`, first in the toolbar) gives the selection, or the text about
  to be typed, its own font (`journal-document/textFont.ts`, stored by name). **Default**,
  first in the list, removes it so the text follows the editor font (settings → Fonts). The trigger shows the font
  at the cursor. Fonts don't carry into markdown.
- **Text color** (`TextColorPicker`) colors the selection, or the text about to be typed
  when nothing is selected. Closing the menu returns focus to the text so typing
  continues in that color. The menu has (no titles; rows have accessible names):
  - **Theme row:** the page text color, then six live tones of the page background, light
    to dark (see `journal-document`); clicking one applies it and closes the menu. The first
    tile removes the text's own color (so it doubles as reset) and is selected by default.
  - **Custom row:** seven saved slots (stored with appearance). An empty slot (dashed)
    opens the color picker; picking fills the slot and applies it. A filled slot applies
    its color on click and can be re-picked. Hovering or focusing it shows a small × to empty it. Text already
    colored keeps its color (the color is stored on the text). This is the shared `ColorMenu`
    (design system), the same menu as each text style's color (see the root `SPEC.md`).
- **Letter spacing** (`TextLetterSpacingPicker`) gives the selection, or the text about to
  be typed, its own letter spacing (`journal-document/textLetterSpacing.ts`, % of its size),
  with the same stepper and range as text styles. It shows the text's own spacing, or its
  style's (`getTextStyleNameAt`: Title in the title, else the paragraph's); **Match style**
  removes the text's own. Letter spacing doesn't carry into markdown.
- **Text glow** (`TextGlowPicker`, after text color) gives the selection, or the text about
  to be typed, a glow in its own color (`journal-document/textGlow.ts`), separate from the
  text color: white text with a pink glow reads as neon. Its menu is text color's with **No
  glow** (crossed out; removes the text's own glow) in place of the page text color, and the
  same custom slots. It overrides the text style's glow. Glows don't carry into markdown.
- **Text case** (`TextCasePicker`, the shared `TextCaseMenu`): UPPERCASE, lowercase, Title
  Case, Sentence case, or "As typed" (back to its text style's case). Display-only: the
  letters typed are stored unchanged (see `journal-document`). Text styles' cases reach the
  editors through `useTextStyleCases` (the title is all Title; the writing's blocks map to
  styles by `getBlockTextStyleName`; code blocks have none).
- **Copy as markdown** (entries' `copyEntryAsMarkdown`, via `documentToMarkdown`; in the entry ⋯
  menus) serializes with
  `@tiptap/markdown` and writes to the clipboard; the app confirms with a toast.

## Keyboard

- `⌥↑` / `⌥↓` move the current block (or all selected blocks) up/down, like VS Code
  (`moveBlocks.ts`). List items move as a whole. At the edge of a container nothing moves,
  unless the selection fills the container (e.g. a one-paragraph quote), in which case the
  container moves.
- Caret navigation (`⌘←/→`, `⌥←/→`, `⌘↑/↓`, with `⇧` to select) is native browser behaviour.
- **Every styling shortcut has a visible control** (and nothing hides in a shortcut only):
  the toolbar's buttons (`formattingActions.ts`: bold ⌘B, italic ⌘I, underline ⌘U,
  strikethrough ⇧⌘X, code ⌘E, bulleted ⇧⌘8 / numbered ⇧⌘7 lists, quote ⇧⌘B, code block ⌥⌘C)
  show their shortcut in the tooltip and `aria-keyshortcuts`; text styles show theirs in the
  menu (Body ⌥⌘0, Heading 2–6 ⌥⌘2–6). Shortcuts are written once in Tiptap form and
  displayed by `utils/shortcuts.ts` (Mac symbols in Apple's order, or Ctrl+… elsewhere).
  Strikethrough moved off Tiptap's ⇧⌘S, which saves all entries.
- Buttons and menus whose node or mark the focused editor lacks are off (e.g. lists and text
  styles in the title), by checking the editor's schema (`editorSupports`).
- **The toolbar acts on the last-focused editor** (`useActiveEditor`): the writing or the
  title.
- `⌘Z` / `⇧⌘Z` (undo / redo) come from Tiptap's StarterKit.
- `⇧⌘>` / `⇧⌘<` step the current paragraph's text style up / down (`textStyleShortcuts.ts`).
  `⇧⌘+` is left to the browser, where it zooms the page.
- **Tab** inserts a tab (shown 4 spaces wide, `--tab-size`); **Shift+Tab** removes one from
  the start of the line. In lists, Tab/Shift+Tab indent and outdent the item instead
  (`TabIndent` has lower priority than list keymaps). To avoid a keyboard trap,
  **Escape then Tab** moves focus out as usual; a hidden hint linked via
  `aria-describedby` says so.

## Decisions

- **Title in markdown:** when the entry has a custom name, Copy as markdown puts it first as
  the one `#` heading; content headings already start at `##`, so nothing moves.
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
