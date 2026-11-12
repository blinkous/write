# Appearance

User-adjustable look of the writing page: font, margins, vertical spacing and colors. Overall
text size is left to browser zoom; size differences come from text styles (editor). All page-wide.

## How it works

- Each control is exported separately so the app orders them in the toolbar: `FontPicker`,
  `MarginsMenu` (a thin wrapper over the generic `OptionMenu`: an icon
  trigger opening a list of choices) and `SpacingMenu`. The
  font trigger shows the font name; the others are icons whose accessible label includes
  the current value.
- **Units:** line spacing is shown as real multipliers, like word processors; margins keep
  preset names (Wide/Normal/Narrow/None), as word processors do. A test checks the line
  spacing labels match the design tokens.
- **Spacing** is one menu: line spacing as real multipliers (1.4, 1.7, 2.0, 2.4), a
  separator, then actions whose labels flip with the state, like Google Docs: **Add/Remove
  paragraph gap** (a half-line gap,
  `--space-paragraph-gap`, from the editor's font size × line spacing) and **Add/Remove
  paragraph indent** (book-style first-line indent, `--size-paragraph-indent`, on paragraphs that
  follow a paragraph, so not the first after a heading). Line spacing values are stored as
  names (e.g. `relaxed`), separate from labels, so labels can change freely.
- **Migration:** paragraph spacing used to be a size (none/small/normal/large); a stored size
  becomes "on" unless it was "none". The old field is dropped on the next save, and loading
  migrated data changes nothing (tested).
- The font list shows each name in its own font. Selection applies immediately, so arrow
  keys preview fonts live.
- Color changes apply instantly: nothing transitions background or text color, so the
  page doesn't lag behind the header and sidebar while dragging a color picker.
- Options live in `appearanceOptions.ts`. Each choice maps to a design token or CSS
  variable, which `applyAppearance.ts` sets on `<html>`; components only read variables.
- **Page colors** (`PageColorsPicker`, the palette icon in the sidebar) are a free-form
  background and default text color (default: dusty rose). The menu matches the text color
  menu: same swatch tiles, a tile + label per color (clicking either opens the picker),
  then small undo/redo icons in the menu footer (rarely used, so kept quiet). They live apart from the
  toolbar's per-text color so the two aren't confused.
  Surface, border and muted colors derive from them with `color-mix()` in `tokens.css`.
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
- **Undo/redo** in the page colors menu covers the last 50 color changes and survives a
  refresh (`pageColorHistory.ts`, stored under `write.pageColorHistory.v1`; unreadable steps
  are dropped, never more than 50 kept). A whole drag in a color picker is one step: an edit begins on
  the first change and is committed on the input's native `change` event or when the
  menu closes.
- **Custom text colors** (seven slots, `#rrggbb` or empty; older saves get empty slots added) are stored here so they persist;
  the editor's text color menu fills and uses them.
- Each stored field is validated on its own, so one stale value doesn't reset the others,
  and settings added later fall back to their defaults for older saved data.

## Decisions

- No contrast warnings: users can see whether their colors are readable.

## Adding a font

See the header comment in `fontOptions.ts`: install the Fontsource package, import it, add
an entry to `FONT_OPTIONS`. Fonts are bundled, so nothing is fetched at runtime. Font
previews normalize x-height (`font-size-adjust`) so every name is legible in the list.
