# Text styles

How each text style looks: Title, Heading 2–6, Body and Small. Shared by the editor (which
draws them), the entry title, the style menu (which previews them) and settings (which edits
them).

## How it works

- `textStyleSettings.ts` defines each style's settings: **size** (px at normal zoom, 10–48,
  written as rem so browser zoom still works), **bold**, **italic**, **underline**,
  **strikethrough**, **letter spacing** (% of the size, −5 to 30), **case** (null = as typed), **font** (null = the editor font), **color** (a theme color name or
  `#rrggbb`; null = the page text color) and **glow** (the same kinds of color; null = no glow). Defaults match the original look (headings and
  title bold).
- `getTextStyleVariables` turns them into CSS variables, `--text-style-<name>-size | -scale |
-weight | -style | -decoration | -letter-spacing | -transform | -preview-transform | -font |
-color | -glow` (`-scale` is relative to body, for previews at another size). The
  appearance feature sets them on `<html>`; `tokens.css` holds the same defaults for the first
  paint (a test keeps them in sync).
- Stored settings are read leniently (`textStylesSchema`): each setting of each style falls
  back to its default on its own.

## Decisions

- Text with its own font or color (toolbar) still wins over its style: marks sit inside.
- Sizes step by 1px within a range, like a word processor, so styles stay sensible.
- `TextStylePreview` draws text in a style at its size relative to body (via `-scale`), for
  showing a style's name in the style menu.
- Glow is its own color, separate from the text color, drawn as a stack of `text-shadow`s
  (blur radii in em, so it scales with the text). Neon is white text with a colored glow;
  toolbar colors inside a glowing style change the letters, never the glow, and a toolbar glow
  replaces the style's for that text. The glow's look (`resolveTextGlow`) is shared with the
  toolbar's, from `journal-document`.
- `GlowColorMenu`'s trigger is the letter "A" drawn with the current glow (a soft theme glow
  when there's none, so it still reads as glow). The menu is `TextColorMenu` with "No glow" (a crossed-out tile) in place of the page
  text color; the theme color tiles come from the shared `getThemeColorSuggestions`.
- Case: CSS can only do UPPER and lower, so title and sentence case set `-transform` to
  lowercase and the editor capitalizes letters itself (`useTextStyleCases`, via
  journal-document's text case). Previews show the style's name, already in title case, so
  `-preview-transform` uses CSS's `capitalize` / `none` for them. `TextCaseMenu` is the
  shared case control (toolbar and style edit panels), its options in `textCaseOptions.ts`.
- `TextColorMenu` is the shared text color control (the design system's `ColorMenu` with the
  theme colors as suggestions): the toolbar's color menu and each style's color (in its edit panel).
