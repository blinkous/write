# Fonts

The bundled fonts and the menu for choosing one: for the app and editor fonts
(appearance), selected text (editor) and text styles.

## How it works

- Open-licensed Google Fonts, bundled so nothing is fetched at runtime. To add one, see the
  comment at the top of `fontOptions.ts`.
- The menu previews each name in its own font, with x-heights evened out. Where a
  **Default** option exists ("no font of its own; follow the default"), it's captioned with
  the font it stands for, on the trigger too, never "Default" alone.

## Decisions

- Fonts are stored by name, never as CSS, so documents can't carry arbitrary CSS and a
  font's CSS can change without touching saved writing.
- The Default caption fits inside the control's height, so the toolbar doesn't grow, and
  is a step quieter than the trigger's text so it reads as a caption.
