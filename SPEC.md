# Write

A minimal, private web journal: a clean writing page with adjustable font, size, margins,
spacing and colors, per-text color and case, and export as markdown or JSON.

## Hard rules

- **Local only.** All data lives in `localStorage`. No accounts, servers or analytics.
- **No network at runtime.** Fonts are open-licensed Google Fonts bundled via Fontsource,
  so the app works offline.
- **Locked-down origin.** Builds ship a Content Security Policy (`vite.config.ts`) allowing
  only the app's own scripts, styles and fonts and no network connections, so injected
  content can't read the journal or send it anywhere. Nothing may need inline scripts or
  styles, or `data:` fonts (e.g. Tiptap's CSS is vendored, fonts are never inlined).
- **Dedicated origin.** The app always runs on `localhost:4791` (`strictPort`), because
  `localStorage` is per origin: a shared or shifting port would share or "lose" entries.
- **Never silently lose writing.** Stored data that fails validation is backed up under a
  timestamped `.backup.` key before the app starts fresh (see `src/lib/localStore.ts`).
- **Imports are untrusted.** Validated against a strict format and the document schema,
  all-or-nothing, and never overwrite existing writing (see entries `SPEC.md`).
- Accessible: everything works by keyboard, controls are native elements with labels.

## Out of scope

Sync, sharing, images/attachments, page breaks / print layout (the page scrolls endlessly).

## Storage keys

| Key                        | Owner      | Contents                             |
| -------------------------- | ---------- | ------------------------------------ |
| `write.entries.v1`         | entries    | Array of journal entries             |
| `write.selectedEntryId.v1` | entries    | Last open entry id                   |
| `write.appearance.v1`      | appearance | Font, size, margins, spacing, colors |

Bump the `vN` suffix if a format changes incompatibly. Fields added later must load from
older data without them (see the storage tests).

## Layout

`src/app` composes features; `src/features/*` own user-facing capabilities, each with a
`SPEC.md`; `src/journal-document` is the document schema shared by editor and entries;
`src/design-system` holds tokens and base components; `src/lib` and `src/utils`
hold framework-free helpers.
