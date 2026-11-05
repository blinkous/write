# Appearance

User-adjustable look of the writing page: font, text size, margins, vertical spacing and
colors. All page-wide.

## How it works

- Each control is exported separately (`FontPicker`, `TextSizePicker`, `PageColorsPicker`,
  `MarginsPicker`, `SpacingPicker`) so the app orders them in the toolbar. The font trigger
  shows the font name; the others are icons whose accessible label includes the value.
- **Spacing** sets line spacing (Tight/Normal/Relaxed/Loose) and paragraph spacing
  (None/Small/Normal/Large), mapped to `--line-height-*` and `--space-paragraph-*` tokens.
- The font list shows each name in its own font. Selection applies immediately, so arrow
  keys preview fonts live.
- Color changes apply instantly: nothing transitions background or text color, so the
  page doesn't lag behind the header and sidebar while dragging a color picker.
- Options live in `appearanceOptions.ts`. Each choice maps to a design token or CSS
  variable, which `applyAppearance.ts` sets on `<html>`; components only read variables.
- **Page colors** are a free-form background and default text color (default: dusty rose).
  Surface, border and muted colors derive from them with `color-mix()` in `tokens.css`.
  There are no theme presets.
- The page text color is the default for all text: text without its own color (see the
  editor's text color) references it, so changing it recolors that text automatically.
- Each stored field is validated on its own, so one stale value doesn't reset the others,
  and settings added later fall back to their defaults for older saved data.

## Decisions

- No contrast warnings: users can see whether their colors are readable.

## Adding a font

See the header comment in `fontOptions.ts`: install the Fontsource package, import it, add
an entry to `FONT_OPTIONS`. Fonts are bundled, so nothing is fetched at runtime. Font
previews normalize x-height (`font-size-adjust`) so every name is legible in the list.
