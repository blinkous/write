# Text styles

How each text style looks: Title, Heading 2–6, Body and Small. Shared by the editor, the
entry title, and the style menu.

## Settings

Each style has a **size** (10–48 px, in rem so browser zoom works), **bold**, **italic**,
**underline**, **strikethrough**, **letter spacing** (% of size, −5 to 30), **case** (or as
typed), **font** (or the editor font), **color** (or the page text color) and **glow** (or
none). Defaults match the original look (headings and title bold). Each setting of each
style loads on its own, falling back to its default.

## Decisions

- Text's own formatting (toolbar) wins over its style.
- Sizes step by 1px within a range, like a word processor, so styles stay sensible.
- Glow is its own color, separate from text color: white text with a colored glow reads as
  neon. A toolbar color changes the letters, never the glow; a toolbar glow replaces the
  style's for that text. Both draw the glow the same way.
- The style menu previews each name in its style, scaled relative to Body. Names are
  already title case, so title and sentence case preview as written.
