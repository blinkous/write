# Appearance

User-adjustable look: fonts, text styles, margins, vertical spacing and colors. All
page-wide, with one shared undo/redo (fonts, styles, colors, tab title, background blur and
opacity), in the settings drawer's header.

## How it works

- Each control is exported separately so the app orders them in the toolbar: `MarginsMenu`
  (a thin wrapper over the generic `OptionMenu`: an icon trigger opening a list of choices)
  and `SpacingMenu`, icons whose accessible label includes the current value.
- **Units:** line spacing is shown as real multipliers, like word processors; margins keep
  preset names (Wide/Normal/Narrow/None), as word processors do. A test checks the line
  spacing labels match the design tokens.
- **Margins** set the page's width two ways, and the smaller wins: a page width
  (`--width-page-*`, which decides on wide windows) and a share of the room (`--share-page-*`:
  80, 90, 95 or 100%, which decides on phones, where every page width is wider than the
  screen). So each margin looks different at any window size.
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
  **tab title** (`EditableText`: quiet text at the row's end, like the font's name, showing
  the app's name, "Write", while empty; the whole space after the label is the button (hover included); click it to type in place, Enter or clicking away
  keeps it, Escape puts it back; up to 60 characters, a longer saved one falls back to
  empty; it's the tab's title, or "Write" when empty), the
  interface font (sidebar, toolbar, menus; sets `--font-ui`; default Inter), then the page
  colors (`PageColorSettings`, below): **Foreground**, then **Background** with the background
  picture or video. **Editor**
  (`EditorSettings`) has the editor font (sets `--font-editor`; default Lora), the default for
  every text style, then **Reset all styles**, which resets every style and sets the editor
  font to the app font. **Text styles** (Title, Heading 2–6, Body, Small; see `src/text-styles`) are
  kept here (`changeTextStyle`, `resetTextStyle`, with undo/redo) and edited from the
  toolbar's style menu (see the editor's SPEC). **Page colors**
  (`PageColorSettings`, in App) are the free-form foreground (the default text color, named so
  it isn't mistaken for a text setting) and background
  (first visit: oat `#ede3d6` in light mode, cocoa `#2b211c` in dark, from the system
  setting, `DEFAULT_PAGE_COLORS`; saved colors always win and don't follow later system
  changes), as `LabeledRow`s like the font rows: the name, then
  its ✨ match button and swatch tile at the end (only the tile opens the picker, not the name). `ThemeHistoryButtons` (the drawer's
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
- **Each page color changes only when you change it.** A ✨ button before each tile
  (`MatchColorButton`) picks a match for the other color, once, as one undo step:
  Foreground's picks the derived text color for the background (`deriveCozyTextColor`),
  Background's picks a page for the text color (`deriveCozyBackgroundColor`: the text
  ramp walked back, so a derived text color gives about its page back; pages stay soft,
  chroma capped, even for vivid text).
- **Undo/redo** covers fonts, colors, text styles, the tab title and the background's blur and
  opacity together (not choosing or removing the background file, which isn't kept): the last 50
  changes, surviving a refresh (`pageThemeHistory.ts`, stored under `write.pageThemeHistory.v1`;
  unreadable steps are dropped, never more than 50 kept). The older color-only history
  (`write.pageColorHistory.v1`) is read once, its steps given the current font, and left as a
  backup. Steps saved before a setting joined history take its current value. A font pick, a
  stepper press or a typed blur/opacity is one step; typing a tab title is one step once the
  field is left. Steps saved with one font (before the app font) treat it as
  the editor font. A whole drag in a color picker is one step: an edit begins on
  the first change and is committed on the input's native `change` event or when the
  menu closes.
- **Custom text colors** (seven slots, `#rrggbb` or empty; older saves get empty slots added) are stored here so they persist;
  the editor's text color menu fills and uses them.
- Each stored field is validated on its own, so one stale value doesn't reset the others,
  and settings added later fall back to their defaults for older saved data.

## Background picture or video

- Chosen in **App**, on the **Background** row: a tile (`FileSwatch`, via
  `BackgroundMediaTile`) before the color tile. Empty, it shows + and a picture icon; clicking it
  opens a file picker (any image, including GIFs, or video, up to 100 MB). Once one is set, it
  shows a small still of it (a video's first moment); clicking changes it, and an × on hover or
  focus removes it, like custom color slots. While one is set, two steppers follow the row,
  indented under it (`BackgroundMediaEffects`, in a `NestedRows` group): **Blur** (0–40 px, by 0.5; any tenth can be
  typed, e.g. 0.2) and **Opacity** (0–100 %, by 10; any whole percent can be typed; default 50: how much of the media shows over the page color, so writing stays
  readable; briefly saved the other way round as a fade, which loads as its opposite).
  Other files get a warning toast and the current background stays.
- The file is kept in IndexedDB (`lib/blobStore.ts`, key `background-media.v1`), saved before
  it's shown, so what's shown is what comes back after a refresh. Blur and opacity are appearance
  fields (localStorage, exported with settings); settings files don't carry the file itself.
- `BackgroundMediaLayer` draws it behind the whole window (fixed, `object-fit: cover`), at its
  opacity over the page color. The blur is an SVG filter (Gaussian blur, then made fully opaque,
  within the media's own box) rather than CSS `blur()`, whose edges fade to transparent: WebKit's
  GPU path clips the media to the window before blurring, so even oversized media showed the page
  color at the window's edges (after a reload in Safari, until a resize). Videos
  loop silently, and stay on their first frame when the system asks for less motion (GIFs
  can't be paused, so they still play). It's decorative: hidden from screen readers.
- While it's shown, the sidebar and header are transparent, so it fills the whole window, and
  its blur and opacity are the only effects on it. The settings drawer, menus and dialogs stay
  solid so they're always readable, as does the sidebar on narrow screens, where it slides
  over the writing.

## Decisions

- No contrast warnings: users can see whether their colors are readable.

## Adding a font

See `src/fonts/SPEC.md`.
