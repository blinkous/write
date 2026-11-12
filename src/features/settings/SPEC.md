# Settings

The settings drawer at the bottom of the sidebar.

## How it works

- `SettingsDrawer` is a ⚙ toggle at the bottom right of the sidebar (no divider, tucked close
  to the edge) that slides a drawer up above it
  (the design-system `Drawer`). It isn't a menu: it stays open until toggled closed, and the
  entries list shrinks to share the sidebar, so both stay usable. Whether it's open is
  remembered (`write.settingsOpen.v1`).
- **Sections fold** under their titles (`DrawerSection`: native details/summary with a
  chevron at the right; the whole title line toggles, Enter/Space too). An open section's
  chevron shows only on hover or focus (as in macOS sidebars), so it isn't mistaken for the
  rows' dropdown chevrons; folded sections and touch screens always show it. All start open; folded ones are
  remembered by id (`write.settingsClosedSections.v1`), so new sections always appear open.
- Rows in a section use regular weight (menu rows are medium in popover menus), so the Data
  actions match the font and color rows.
- The app passes the sections in (id, title, contents), so features don't import each other: Fonts and Colors
  (appearance), Data (entries: exports, import, About). The header holds one undo/redo for
  fonts and colors together (appearance's theme history).

## Decisions

- A drawer rather than separate menus: settings are browsed and adjusted together, often
  while looking at the page, and font menus open from it directly (no menu inside a menu).
- The drawer's height is capped (`--height-drawer-max`) and scrolls, so the entries above
  always keep some room.
