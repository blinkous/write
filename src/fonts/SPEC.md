# Fonts

The bundled fonts and the menu for choosing one. Used for the app and entries fonts (appearance settings), the
font of selected text (editor) and rendering text fonts in documents (journal-document).

## How it works

- `fontOptions.ts` lists the fonts: open-licensed Google Fonts bundled through Fontsource, so
  nothing is fetched at runtime. Each has a stored `value` (e.g. `lora`), a label and a CSS
  family. To add one, see the comment at the top of that file.
- `FontMenu` is a trigger showing the font in use (in that font) that opens the list, each
  name previewed in its own font (x-heights evened out with `font-size-adjust`). With
  `defaultFont`, a first **Default** option, captioned with that font's name, means "no font of
  its own; follow the default"; the trigger then reads "Default / Lora". Picking with a click,
  Enter or Space closes the menu; arrow keys preview without closing.

## Decisions

- Fonts are stored by value, never as CSS strings, so documents can't carry arbitrary CSS
  and a font's CSS can change without touching saved writing.
