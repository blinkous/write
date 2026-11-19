# Editor

The rich-text writing surface for one entry, and its toolbar.

## The toolbar

- Sits over the page, lined up with the start of the text; when the header is too narrow
  it centers between the sidebar toggle and the ⋯, then scrolls sideways with faded ends.
- **Three groups**, broadest first. **Text:** style, font, color, bold, italic, underline,
  strikethrough, then glow, case and letter spacing. **Markup:** lists, quote, code and
  code block (together, since both mean "this is code"). **Page:** margins, spacing.
- **Every control shows what's in effect, the text style's included:** bold is pressed in
  a bold style, and pressing it turns bold off for that text.
- **Choosing what the style already gives removes the text's own**, so it follows its style
  again; anything else becomes its own, including "none" where the style has one (page text
  color, no glow, as typed).
- It acts on the last-focused editor (the writing or the title); controls the focused
  editor can't use (e.g. lists in the title) are off.
- Font, color, glow, case and letter spacing apply to the selection, or to the text about
  to be typed. Closing the color menu returns focus to the text.

## Text styles

- Small, Body and Heading 2–6 mirror markdown (`##`–`######`). Heading 1 is the entry's
  title, so `# ` stays text. Small is mostly used like a caption.
- The menu previews each name in its style. Each row's ⋯ has **Update style to match text**,
  **Update text to match style**, **Size** and **Reset style**. In the title the menu lists
  only Title, to edit it.
- **Update style to match text** gives the style the selected text's look (not size). Text
  of that style in the selection keeps its exact look, rewritten relative to the new style:
  what the style now gives stops being the text's own, and what still differs stays (a
  word left plain in a now-bold style becomes "not bold"). The style change and the text
  change are separate undo steps (settings' undo and the editor's).
- **Update text to match style** clears the selected paragraphs' own look; links and code
  stay.

## Colors and glow

- **Text color:** the theme tones (the page text color first, then six tones of the
  background, which follow it), then the custom slots, then the color picker (see
  appearance). Text keeps its color when a slot changes.
- **Glow** is its own color, separate from text color (white text, pink glow reads as
  neon). Its menu is the color menu with **No glow** first.

## Keyboard

- **Shortcuts show in their control's tooltip or menu,** and all of them, shortcut-only ones
  too, are listed and changeable in the Keyboard shortcuts dialog (see keyboard-shortcuts). Defaults: ⌘B, ⌘I, ⌘U, ⇧⌘X strikethrough,
  ⌘E code, ⇧⌘8 / ⇧⌘7 lists, ⇧⌘B quote, ⌥⌘C code block, ⌥⌘0 Body, ⌥⌘2–6 headings.
- ⇧⌘. / ⇧⌘, (⇧⌘> / ⇧⌘<) step Small → Body → H6 … H2 and back. ⇧⌘+ stays the browser's zoom.
- ⌥↑ / ⌥↓ move blocks, like VS Code; list items move whole, and a container moves when the
  selection fills it.
- Markdown shortcuts work while typing (`## `, `- `, `> `, `**bold**`).
- **Tab** inserts a tab (4 spaces wide); Shift+Tab removes one. In lists they indent and
  outdent. **Escape then Tab** leaves the editor (no keyboard trap), as a hidden hint says.
- Undo history is per entry.

## Copying

- ⌘C copies as any app does: formatted text, and plain text for plain-text apps.
- **Two markdown copies:** **Copy selection as markdown** (⌥⇧⌘C, shortcut only; with
  nothing selected in the writing it says so) and **Copy entry as markdown** (in each entry's
  ⋯, the whole entry under its title; no shortcut until someone sets one).
- They copy like ⌘C, with markdown as the plain text: plain-text apps get markdown, while
  the journal and apps that take formatting paste it formatted. Paste and Match Style
  (⇧⌘V) gives the markdown anywhere.
- Part of one block copies inline: a few words of a heading aren't a heading, and code
  copies as typed. A whole block or more keeps its block markdown (`##`, `- `, `> `).

## Decisions

- Content is stored as Tiptap JSON because it's lossless; markdown is made on export.
- **Copy as markdown** puts a custom name first as the one `#` heading (content headings
  already start at `##`). Markdown has text as typed, not as cased, and no colors, fonts,
  glow or letter spacing; JSON keeps them all.
- Copied markdown turns tabs into two em spaces outside code, since leading whitespace
  makes a markdown code block.
- Markdown export is checked by round-trip tests.
- Editors carry Grammarly and LanguageTool opt-outs (see privacy).
