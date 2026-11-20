# Keyboard shortcuts

Every action that has a shortcut, the keys it's on, and the settings to change them.

## How it works

- **One list of actions** (formatting, lists and code, text styles, moving blocks, and the
  entry's copy, export and import), each with a default. Keys every app shares (undo,
  copy, paste, Tab, Enter, Escape) aren't in it and never change.
- **Actions may start without a shortcut** (Copy entry as markdown), for someone to set
  one.
- **Editor actions** work while typing in the writing or the title (the title only has
  emphasis). **Entry actions** work anywhere on the page, instead of the browser's (⌘S
  saving the page, ⌘O opening a file).
- **Controls show the keys in effect,** so a changed shortcut shows up in its tooltip or
  menu item at once.
- **Shown only where there's likely a keyboard.** Browsers can't tell whether there's one;
  a mouse or trackpad is the closest sign (desktops, iPads with a keyboard case), so
  without one (phones) shortcuts are hidden by default. **Show shortcuts in menus and
  tooltips**, atop the dialog, overrides that on this device (it isn't in settings backups,
  since devices differ). Hidden shortcuts still work.

## Changing them

- **Settings › Data › Keyboard shortcuts** opens a dialog (the list is long and needs
  room) with every action under its group, its keys on a button. Press the button, then
  the new keys. Escape cancels (without closing the dialog), Backspace or Delete leaves it
  with none, Tab moves on (no keyboard trap).
- **Each row:** the action's name, ↺ back to the default when it differs, the shortcut,
  then an always-visible × that removes it (off when there's none), at the edge like every
  settings row. Every row shares the same columns: the ↺'s place is kept when there's
  nothing to reset, and the shortcuts' column is as wide as the longest one, so each ↺
  sits in the same spot down the whole list. A long name is cut short with "…" rather
  than pushing the buttons out.
- **A shortcut needs ⌘ or Ctrl, or ⌥ with a key that doesn't type** (arrows), so writing
  never sets one off. Keys that edit text (⌘C, ⌘V, ⌘X, ⌘A, ⌘Z) or that the
  browser keeps are refused, with the reason. Some of the browser's (⌘W, ⌘T, ⌘N, ⌘Q) never
  reach the page at all: the browser acts on them first.
- **One key, one action:** giving an action keys another has moves them, and a note under
  the row says so ("⌘B moved from Bold, which has none now"); refusals show there too,
  rather than in a toast hidden behind the dialog.
- ↺ takes the default back from whoever has it. **Reset shortcuts** is the dialog's last
  row and asks first, since it loses every change. Not in settings undo: the resets cover it.

## Data

- Only changes are stored (`write.shortcuts.v1`), so defaults can improve later. Settings
  backups carry them; unknown actions or keys that aren't allowed are dropped one by one.
- Stored with ⌘ as "Mod", so the same settings mean ⌘ on Apple devices and Ctrl elsewhere.

## Decisions

- **⌥⇧⌘C copies the selection as markdown**, not ⇧⌘C: that's the element inspector in Chrome and Edge,
  which pages can't take. People in other browsers can choose ⇧⌘C.
- Keys are matched by the key typed and by its place on the keyboard, as ProseMirror does,
  so shortcuts hold on other layouts and with ⌥ (which types "ç" for C on a Mac).
- Tiptap's own shortcuts for keys an action has by default are removed, so a key someone
  moved elsewhere stops working rather than still bolding through Tiptap.
