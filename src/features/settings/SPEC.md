# Settings

The settings drawer at the bottom of the sidebar.

## How it works

- A ⚙ at the bottom of the sidebar slides the drawer up. It isn't a menu: it stays open
  until toggled, and the entries list shrinks to share the sidebar, so both stay usable.
  Whether it's open is remembered.
- While open, the drawer and its bar are one solid panel in the sidebar's color, so
  settings stay readable over a background picture. The bar shows one undo/redo for every
  setting but the background file, beside the ⚙. No header (it saves a row); it's still
  named "Settings" for screen readers.
- **⌘Z / ⇧⌘Z undo and redo settings while focus is in the drawer** (Ctrl+Z, Ctrl+Shift+Z or
  Ctrl+Y elsewhere), like its buttons. Text fields in it keep their own undo; outside the
  drawer (the writing, anywhere else) the keys never touch settings, so a change can't be
  undone where its buttons aren't showing. A click anywhere in it counts as being in it
  (WebKit doesn't focus clicked buttons). The undo or redo button flashes its hover look
  when its key does something, so it's clear what happened.
- **Sections fold** under their titles: Theme and Editor (appearance), then Data (tab title,
  export, import, keyboard shortcuts, reset, About). Open ones are remembered. An open section's chevron shows
  only on hover or focus (as in macOS sidebars), so it isn't mistaken for a dropdown's.
- Features hand their sections to the app, so features don't import each other.
- **Settings backups:** exported from Data's Export dialog, alone or inside a journal file
  (see entries): fonts, text styles, colors, custom color slots, margins, spacing, sort and
  changed shortcuts, not UI state or the background file. Files without shortcuts leave
  them as they are. One Import takes both: a settings file applies its
  settings (bad values fall back on their own; newer versions are refused); anything else
  goes to the journal import.
- **Reset all settings and styles** asks first, suggesting an export, then restores a first
  visit's look: every appearance setting, colors for the system's light or dark mode, the
  default shortcuts (shown or hidden by device again), the default sidebar width, no
  background file, and an empty undo history. Entries, sort and passing UI state (the open
  drawer, folded sections) stay: you reset from inside the drawer, so closing or folding
  it would pull it away mid-action. It can't be undone.

## Decisions

- A drawer rather than separate menus: settings are browsed and adjusted together, often
  while looking at the page, and font menus open from it directly (no menu in a menu).
- The drawer grows up to the search bar, then scrolls; an upward shadow marks its top.
