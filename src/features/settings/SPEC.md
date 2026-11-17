# Settings

The settings drawer at the bottom of the sidebar.

## How it works

- `SettingsDrawer` is a ⚙ toggle at the bottom right of the sidebar (no divider, tucked close
  to the edge) that slides a drawer up above it
  (the design-system `Drawer`). It isn't a menu: it stays open until toggled closed, and the
  entries list shrinks to share the sidebar, so both stay usable. Whether it's open is
  remembered (`write.settingsOpen.v1`).
- **While open, the drawer and its bar are one solid panel** in the sidebar's color, reaching
  the sidebar's edges and bottom (the sidebar sets `--settings-bleed` to its padding), so
  settings stay readable over a background picture.
- **Sections fold** under their titles (`DrawerSection`: native details/summary, a quiet
  title with a chevron at the right; the whole title line toggles, Enter/Space too; folding and unfolding slide, and a section stays open while it slides shut since browsers hide a closed one's content at once). An open section's
  chevron shows only on hover or focus (as in macOS sidebars), so it isn't mistaken for the
  rows' dropdown chevrons; folded sections and touch screens always show it. All start folded, so a first look shows
  just the titles; open ones are remembered by id (`write.settingsOpenSections.v1`), so new
  sections appear folded. The older record of folded sections
  (`write.settingsClosedSections.v1`) is read once, keeping the rest open, and left as a
  backup.
- Rows in a section use regular weight (menu rows are medium in popover menus), so the Data
  actions match the font and color rows.
- The app passes the sections in (id, title, contents), so features don't import each other: App and
  Editor (appearance), Data (entries: exports, import, About). The drawer has no header: while open, the
  bottom bar shows one undo/redo for every setting but the background file (appearance's theme history)
  beside the ⚙, which is shaded while open (like any open panel's toggle, via `aria-expanded`).
  Closed, the bar is just the ⚙. This saves a row; the drawer is still named "Settings" for
  screen readers.

- **Settings backups** (`settingsFile.ts`, `useSettingsTransfer`): exported from Data's
  Export dialog, alone or inside a journal export (see entries `SPEC.md`). Alone, it saves
  `{ format: 'write-settings', version: 1, exportedAt, appearance, entrySort }`; inside a
  journal file, the same record without `exportedAt` (`toSettingsRecord`, read back with
  `parseSettingsRecord`). Fonts,
  text styles, colors, custom color slots, margins, spacing and sort, not UI state. There's
  one Import: a settings file applies its settings (read like stored ones, so bad values fall
  back on their own; newer versions are refused); anything else goes to the journal import.

- **Reset all settings and styles…** (Data, above About; a plain row, as there are no warning colors)
  asks first (`ConfirmDialog`, Cancel focused), then puts every look back to a first visit's: all appearance settings, colors for
  the system's light or dark mode (`getFirstVisitAppearance`), the background file, and an
  empty undo history (`clearHistory`), since a first visit has none. Entries, the sort and UI
  state (open drawer, folded sections, export choices) stay. A toast confirms it. It can't be
  undone; the dialog suggests exporting settings first.

## Decisions

- A drawer rather than separate menus: settings are browsed and adjusted together, often
  while looking at the page, and font menus open from it directly (no menu inside a menu).
- The drawer grows as far as the search bar (the entries list gives up its room and scrolls)
  and scrolls past that; an upward shadow marks its top edge so the line reads clearly.
