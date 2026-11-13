# Text styles

How each text style looks: Title, Heading 2–6, Body and Small. Shared by the editor (which
draws them), the entry title, the style menu (which previews them) and settings (which edits
them).

## How it works

- `textStyleSettings.ts` defines each style's settings: **size** (px at normal zoom, 10–48,
  written as rem so browser zoom still works), **bold**, **italic**, **underline**,
  **strikethrough**, **letter spacing** (% of the size, −5 to 30), **font** (null = the editor font) and **color** (a theme color name or
  `#rrggbb`; null = the page text color). Defaults match the original look (headings and
  title bold).
- `getTextStyleVariables` turns them into CSS variables, `--text-style-<name>-size | -scale |
-weight | -style | -decoration | -letter-spacing | -font |
-color` (`-scale` is relative to body, for previews at another size). The
  appearance feature sets them on `<html>`; `tokens.css` holds the same defaults for the first
  paint (a test keeps them in sync).
- Stored settings are read leniently (`textStylesSchema`): each setting of each style falls
  back to its default on its own.

## Decisions

- Text with its own font or color (toolbar) still wins over its style: marks sit inside.
- Sizes step by 1px within a range, like a word processor, so styles stay sensible.
- `TextStylePreview` draws text in a style at its size relative to body (via `-scale`), for
  showing a style's name in the style menu and in settings.
- `TextColorSwatches` / `TextColorMenu` are the shared text color controls: the toolbar's
  color menu and each style's color in settings.
