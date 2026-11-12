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

| Key                          | Owner      | Contents                             |
| ---------------------------- | ---------- | ------------------------------------ |
| `write.entries.v1`           | entries    | Array of journal entries             |
| `write.selectedEntryId.v1`   | entries    | Last open entry id                   |
| `write.appearance.v1`        | appearance | Font, size, margins, spacing, colors |
| `write.pageColorHistory.v1`  | appearance | Page color undo/redo steps (max 50)  |
| `write.privacyNoticeSeen.v1` | privacy    | Privacy notice was dismissed         |

Bump the `vN` suffix if a format changes incompatibly. Fields added later must load from
older data without them (see the storage tests).

## UI patterns

- **Menus** open from a toolbar or ⋯ button and share one look: the `Popover` panel, rows
  from `MenuItem` (actions) or `ChoiceGroup` (pick one), swatch sections in `PopoverPanel`,
  and `Divider` between sections. Same padding, row height, hover and selected states.
  Rarely used actions (undo, reset, clear) are small icons in a `MenuFooter`, not rows.
- **Dialogs** use the design-system `Dialog` (native `<dialog>`: focus trap, Escape, focus
  return) e.g. the welcome/privacy notice; confirmations use
  `ConfirmDialog` (Cancel first, so Enter never confirms by accident). No browser popups.
- **No menu titles:** a menu is named by its trigger (the popover's accessible name), and
  groups get accessible names. If a menu has parts that could be confused, make the items
  self-describing and separate the parts with a `Divider` (e.g. line spacing numbers, then
  "Add paragraph gap" / "Remove paragraph gap" actions). Menus size to their content.
- **Settings show real units** where people expect them (line spacing as a multiplier) rather
  than S/M/L; preset names are fine where editors use them (margins). Size differences in
  writing come from markdown-style text styles; overall size is browser zoom.
- **Secondary and destructive actions** live in a ⋯ menu at the end of their bar.

## Layout

`src/app` composes features; `src/features/*` own user-facing capabilities, each with a
`SPEC.md`; `src/journal-document` is the document schema shared by editor and entries;
`src/design-system` holds tokens and base components; `src/lib` and `src/utils`
hold framework-free helpers.
