# Write

A minimal, private web journal: a clean writing page with adjustable font, size, margins,
spacing and colors, per-text color and case, and export as markdown or JSON.

## Hard rules

- **Local only.** All data lives in the browser: `localStorage`, plus IndexedDB for files too
  big for it (the background picture or video, `src/lib/blobStore.ts`). No accounts, servers
  or analytics.
- **No network at runtime.** Fonts are open-licensed Google Fonts bundled via Fontsource,
  so the app works offline.
- **Locked-down origin.** Builds ship a Content Security Policy (`vite.config.ts`) allowing
  only the app's own scripts, styles and fonts and no network connections, so injected
  content can't read the journal or send it anywhere. Nothing may need inline scripts or
  styles, or `data:` fonts (e.g. Tiptap's CSS is vendored, fonts are never inlined).
  Pictures and videos may be `blob:` URLs: the background, read from IndexedDB.
- **Dedicated origin.** The app always runs on `localhost:4791` (`strictPort`), because
  `localStorage` is per origin: a shared or shifting port would share or "lose" entries.
- **Never silently lose writing.** Stored data that fails validation is backed up under a
  timestamped `.backup.` key before the app starts fresh (see `src/lib/localStore.ts`).
- **Imports are untrusted.** Validated against a strict format and the document schema,
  all-or-nothing, and never overwrite existing writing (see entries `SPEC.md`).
- Accessible: everything works by keyboard, controls are native elements with labels, and
  text meets WCAG AA contrast (4.5:1). Muted text is soft by default (a cozy choice) and
  becomes 4.5:1 when the system asks for more contrast. Checked with axe-core in light
  and dark mode, with the drawer, menus and dialogs open. Visible labels are part of each
  control's accessible name; shortcuts are given as `aria-keyshortcuts`. Disabled controls
  don't react to hover. Toggles for open panels (sidebar, settings) show as pressed.

## Out of scope

Sync, sharing, images/attachments in entries, page breaks / print layout (the page scrolls endlessly).

## Storage keys

| Key                               | Owner      | Contents                                                                    |
| --------------------------------- | ---------- | --------------------------------------------------------------------------- |
| `write.entries.v2`                | entries    | Array of journal entries (v1 kept as a backup)                              |
| `write.selectedEntryId.v1`        | entries    | Last open entry id                                                          |
| `write.entrySort.v1`              | entries    | How the entries list is sorted                                              |
| `write.appearance.v1`             | appearance | Fonts, margins, spacing, colors, tab title, background blur/opacity         |
| `write.settingsOpen.v1`           | settings   | Whether the settings drawer is open                                         |
| `write.settingsClosedSections.v1` | settings   | Folded settings sections, by id                                             |
| `write.pageThemeHistory.v1`       | appearance | Page theme undo/redo steps, max 50 (color-only v1 history kept as a backup) |
| `write.privacyNoticeSeen.v1`      | privacy    | This browser has visited (no welcome entry)                                 |

IndexedDB (database `write-files`, store `files`):

| Key                   | Owner      | Contents                                                              |
| --------------------- | ---------- | --------------------------------------------------------------------- |
| `background-media.v1` | appearance | The background picture, GIF or video (its bytes and type, max 100 MB) |

Bump the `vN` suffix if a format changes incompatibly, migrating from the old key once and
leaving it in place as a backup (see entries `SPEC.md`). Fields added later must load from
older data without them (see the storage tests).

## UI patterns

- **Menus** open from a toolbar or ⋯ button and share one look: the `Popover` panel, rows
  from `MenuItem` (actions) or `ChoiceGroup` (pick one), swatch sections in `PopoverPanel`,
  and `Divider` between sections. Same padding, row height, hover and selected states.
  Rarely used actions (undo, reset, clear) are small icons in a `MenuFooter`, not rows.
  A menu that is a single pick-one list closes once a choice is made (click, Enter, Space);
  arrow keys preview without closing. Menus open with focus on the current choice.
  Panels open below their trigger, or beside it for a row that opens its own panel (a text
  style in settings), lined up with its top so the rows below stay visible.
  Panels are anchored to their trigger only while open: WebKit (Safari, DuckDuckGo) hangs
  when a menu closes with closed, still-anchored menus nested inside it.
- **The settings drawer** (design-system `Drawer`) is for settings browsed together: it
  slides up from the bottom of the sidebar, stays open until toggled, and shares the space
  with the entries (both stay usable). Sections are `DrawerSection`s (foldable, chevron down to unfold
  and up to fold). Settings rows are `LabeledRow`s: the name on the left, the control at the
  end (a menu button, text editable in place, a stepper or a swatch tile), its text lined up
  with the row's edge; text controls there have snugger padding, so their hover stays clear of
  the panel's edge. Swatch tiles are outlined in the muted color (like section titles), so a
  tile matching the page still shows its edge. Color tiles are buttons that open the system
  color picker (a hidden color input), since WebKit never lets the keyboard reach color inputs. Action rows are `MenuItem`s. Quick, single-purpose choices stay in menus.
- **Dialogs** use the design-system `Dialog` (native `<dialog>`: focus trap, Escape, focus
  return) e.g. the welcome/privacy notice; confirmations use
  `ConfirmDialog` (Cancel first, so Enter never confirms by accident). No browser popups.
- **No menu titles:** a menu is named by its trigger (the popover's accessible name), and
  groups get accessible names. If a menu has parts that could be confused, make the items
  self-describing and separate the parts with a `Divider` (e.g. line spacing numbers, then
  "Add paragraph gap" / "Remove paragraph gap" actions). Menus size to their content.
- **Number steppers** (`NumberStepper`, − value +) can also be typed in (applied on Enter or
  leaving the field) or stepped with the arrow keys; values stay within their range. − / + and
  the arrows move to the next step (from 55 by tens: 60 or 50); typed values keep their
  range's precision (e.g. blur to 0.1), which is the step unless set.
- **Settings show real units** where people expect them (line spacing as a multiplier) rather
  than S/M/L; preset names are fine where editors use them (margins). Text sizes are px
  (written as rem, so browser zoom still works), set per text style in settings.
- **Secondary and destructive actions** live in a ⋯ menu at the end of their bar.

## Layout

`src/app` composes features; `src/features/*` own user-facing capabilities, each with a
`SPEC.md`; `src/journal-document` is the document schema shared by editor and entries;
`src/design-system` holds tokens and base components; `src/lib` and `src/utils`
hold framework-free helpers.
