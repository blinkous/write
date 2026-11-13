# Appearance

User-adjustable look: fonts, text styles, margins, vertical spacing and colors. All
page-wide, kept with one shared undo/redo for fonts, styles and colors.

## How it works

- Each control is exported separately so the app orders them in the toolbar: `MarginsMenu`
  (a thin wrapper over the generic `OptionMenu`: an icon trigger opening a list of choices)
  and `SpacingMenu`, icons whose accessible label includes the current value.
- **Units:** line spacing is shown as real multipliers, like word processors; margins keep
  preset names (Wide/Normal/Narrow/None), as word processors do. A test checks the line
  spacing labels match the design tokens.
- **Spacing** is one menu: line spacing as real multipliers (1.4, 1.7, 2.0, 2.4; default 1.4), a
  separator, then actions whose labels flip with the state, like Google Docs: **Add/Remove
  paragraph gap** (off by default; a half-line gap,
  `--space-paragraph-gap`, from the editor's font size × line spacing) and **Add/Remove
  paragraph indent** (book-style first-line indent, `--size-paragraph-indent`, on paragraphs that
  follow a paragraph, so not the first after a heading). Line spacing values are stored as
  names (e.g. `relaxed`), separate from labels, so labels can change freely.
- **Font migration:** there used to be one stored `font`, always the writing's (and briefly
  `entryFont`); the newest of these loads as
  `editorFont`, and `appFont` starts at its default (Inter).
- **Migration:** paragraph spacing used to be a size (none/small/normal/large); a stored size
  becomes "on" unless it was "none". The old field is dropped on the next save, and loading
  migrated data changes nothing (tested).
- Color changes apply instantly: nothing transitions background or text color, so the
  page doesn't lag behind the header and sidebar while dragging a color picker.
- Options live in `appearanceOptions.ts`. Each choice maps to a design token or CSS
  variable, which `applyAppearance.ts` sets on `<html>`; components only read variables.
- **Settings sections** (shown in the settings drawer): **App** (`AppSettings`) has the
  interface font (sidebar, toolbar, menus; sets `--font-ui`; default Inter) and the page
  colors (`PageColorSettings`, below). **Editor**
  (`EditorSettings`) has the editor font (sets `--font-editor`; default Lora), the default for
  every text style, then each text style (Title, Heading 2–6, Body, Small; see
  `src/text-styles`) as a row with an edit (✎) button opening a popover with the
  toolbar's controls: bold, italic, underline, strikethrough and color (`TextColorMenu`) on one
  line, then the font (Default = editor font) and size (`NumberStepper`, px), then letter
  spacing (`NumberStepper`, % of the size). Then **Reset all styles**, which resets every
  style and sets the editor font to the app font. Letter spacing lives only here, per style
  (not as a toolbar mark), so writing stays simple. **Page colors**
  (`PageColorSettings`, in App) are the free-form background and default text color
  (first visit: oat `#ede3d6` in light mode, cocoa `#2b211c` in dark, from the system
  setting, `DEFAULT_PAGE_COLORS`; saved colors always win and don't follow later system
  changes), as `LabeledRow`s like the font rows: the name, then
  its swatch tile at the end (clicking either opens the picker). `ThemeHistoryButtons` (the drawer's
  header) are the undo/redo for both sections. They live apart from the
  toolbar's per-text color so the two aren't confused.
  Surface and border colors derive from them with `color-mix()` in `tokens.css`. The muted
  color (captions, placeholders, section titles) is soft by default (a cozy choice); when the
  system's "increase contrast" setting is on (`prefers-contrast: more`), it becomes the
  softest mix that reads at 4.5:1 on the page and both surfaces (`lib/readableMuted.ts`).
  There are no theme presets.
- The page text color is the default for all text: text without its own color (see the
  editor's text color) references it, so changing it recolors that text automatically.
- **Cozy palette** (`lib/cozyPalette.ts`, OKLCH via culori), derived from the background:
  - **Default text color:** a step along a tonal ramp of the page (same hue, gently
    contrasting); mid-tone pages compress the ramp so it stays readable.
  - **Theme colors:** seven. First the page text color, so the default is one click
    away; then six rich, low-contrast tones around the page color, light to dark: a
    dusty mauve, an orchid leaning toward purple, three close cousins of the page
    (raspberry, berry, plum) and a wine a touch deeper than the page. Hues lean only a
    little, never toward an unrelated color (e.g. orange on a burgundy page). Tuned from
    hand-picked shades on a burgundy page (a test checks they still match). A tone with
    no room past a near-white or near-black page steps toward the text side instead.
  - **Neutral pages** (black, white, greys) have no hue to build on, so after the text
    color they get a warm light beige accent, then greys spread evenly between the page
    and the text color, light to dark. Near-black pages skip the accent (it reads muddy
    there) and get six greys.
  - Never harsh: chroma capped (no neon), no near-black/near-white tones on colorful
    pages, pale pages get a chroma floor so tones don't grey out, and the text color on a
    neutral page gets a warm tint.
    `applyAppearance` sets the theme tones as `--color-theme-1…7`.
- **Changing the background also sets the page text color** to the derived match; the
  text color can still be changed afterwards.
- **Undo/redo** covers fonts and colors together: the last 50
  changes, surviving a refresh (`pageThemeHistory.ts`, stored under `write.pageThemeHistory.v1`;
  unreadable steps are dropped, never more than 50 kept). The older color-only history
  (`write.pageColorHistory.v1`) is read once, its steps given the current font, and left as a
  backup. A font pick is one step. Steps saved with one font (before the app font) treat it as
  the editor font. A whole drag in a color picker is one step: an edit begins on
  the first change and is committed on the input's native `change` event or when the
  menu closes.
- **Custom text colors** (seven slots, `#rrggbb` or empty; older saves get empty slots added) are stored here so they persist;
  the editor's text color menu fills and uses them.
- Each stored field is validated on its own, so one stale value doesn't reset the others,
  and settings added later fall back to their defaults for older saved data.

## Decisions

- No contrast warnings: users can see whether their colors are readable.

## Adding a font

See `src/fonts/SPEC.md`.
