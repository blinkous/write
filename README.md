# Write

A minimal, private web journal. Everything stays in your browser: no accounts, no
servers, no analytics, and no network requests at all, fonts included.

## Features

- **Rich text** with a clean toolbar: headings, bold/italic, lists, quotes, and markdown
  shortcuts while typing (`# `, `- `, `> `, `**bold**`).
- **Cozy colors:** pick a page background and a matching text color and seven cozy theme
  shades follow it automatically, with undo/redo for your last 50 color changes.
- **Text color and case** for the selection or what you type next. Case (UPPERCASE,
  lowercase, Title Case, Sentence case) is display-only, so your original text is kept.
- **Text styles** like markdown: the title is `#`, then Heading 2–6, Body and Small, from a
  menu or `⇧⌘>` / `⇧⌘<`.
- **Settings drawer** at the bottom of the sidebar: one font for the app and one for the
  editor (19 bundled open-source fonts with live previews), text styles (size, weight, font and color of
  the title, headings, body and small text), page colors with undo/redo, and backups of your
  journal and settings. Margins and line/paragraph spacing sit in the toolbar.
- **Text fonts and colors:** give any text its own font or color, or leave it on the page's.
- **Entries** with search, sorted newest, oldest, last edited or by name. Name them, or let the first line be the name.
- **Export / import:** copy an entry as markdown, export the whole journal as one markdown
  file, or save JSON backups (you choose where) and import them back. Imports never
  overwrite existing writing.
- **Keyboard friendly:** `⌥↑` / `⌥↓` move lines like VS Code, `⇧⌘>` / `⇧⌘<` change text style, `⌘S` / `⇧⌘S` save backups,
  and everything is reachable by keyboard.

## Privacy and security

- Entries and settings are stored in `localStorage` for the app's address only.
- Builds ship a strict Content Security Policy: only the app's own code, styles and fonts
  can load, and network connections are blocked.
- Imported files are treated as untrusted. They're size-capped, validated against a strict
  format and the document schema, and rejected whole if anything is invalid.

Anyone with access to your browser profile or a browser extension with access to all
sites could still read local data. Entries are not encrypted at rest.

## Getting started

Requires Node.js 22.12+ or 24+.

```sh
npm install
npm start       # build and serve the locked-down app at http://localhost:4791
```

The app always uses port 4791. Browser storage is tied to the address, so a different port
would show an empty journal.

### Development

```sh
npm run dev     # dev server with hot reload (no CSP), same address
npm run check   # typecheck, lint, format check, tests
```

Specs describing each part of the app live next to the code: start with
[SPEC.md](SPEC.md), then `src/**/SPEC.md`.

### Adding a font

Fonts come from [Fontsource](https://fontsource.org), which packages Google Fonts for
self-hosting. See the comment at the top of `src/fonts/fontOptions.ts`.

## Built with

[React](https://react.dev), [Tiptap](https://tiptap.dev) (ProseMirror),
[Vite](https://vite.dev), [Zod](https://zod.dev), [Culori](https://culorijs.org) and
[Lucide](https://lucide.dev) icons.

Fonts are licensed under the SIL Open Font License 1.1, except Permanent Marker (Apache
2.0). `src/features/editor/tiptapBase.css` is copied from Tiptap (MIT). Every build includes
`THIRD_PARTY_LICENSES.txt` with the full license and copyright notice of each dependency.

## License

Copyright (C) 2026 blinkous

Write is free software under the [GNU Affero General Public License v3.0](LICENSE): you may
use, study, share and change it, and anyone who shares or hosts a changed version must
publish its full source under the same license.
