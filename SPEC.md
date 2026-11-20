# Write

A minimal, private web journal: a clean writing page with adjustable fonts, text styles,
margins, spacing and colors, per-text color, glow and case, and export as markdown or JSON.

## Hard rules

- **Local only.** Entries and the background file live in IndexedDB, settings in
  `localStorage`. No accounts, servers or analytics.
- **No network at runtime.** Fonts are bundled, so the app works offline.
- **Locked-down origin.** Builds ship a Content Security Policy allowing only the app's own
  scripts, styles and fonts and no network connections, so injected content can't read the
  journal or send it anywhere. Nothing may need inline scripts or styles or `data:` fonts,
  except the color picker library's one fixed stylesheet, allowed by its exact contents (a
  hash); `blob:` media is allowed for the background. The app refuses to run inside another page's
  frame (see privacy).
- **Dedicated origin.** Browser storage is per origin, so a shared or shifting one would
  share or "lose" entries: locally always `localhost:4791`, hosted on its own subdomain
  (`write.dhani.dev`).
- **Never silently lose writing.** Stored data that fails validation is backed up, never
  dropped, and a failed save is announced.
- **Imports are untrusted:** validated strictly, all-or-nothing, and they never overwrite
  existing writing (see entries).
- **License notices ship with the app** for every production dependency, fonts included.
- **Deploys:** every push and pull request runs the checks and a build; pushes to `main`
  then publish to GitHub Pages.
- **Keyboard navigable, always.** Every control, new ones included, can be reached and
  used by keyboard alone: Tab and Shift+Tab (Option+Tab in Safari, which skips buttons on
  plain Tab) reach it, Enter or Space works it, and Escape backs out of what it opened.
  Nothing traps focus: whatever listens for keys (like a shortcut being recorded) still
  lets Tab move on. **While you use the keyboard, whatever has focus shows the focus ring,**
  however it got there (Tab, arrows, or the app moving it); a click or tap leaves none.
  The app tracks the last input itself: browsers' own guess (`:focus-visible`) misses
  focus the app moves (e.g. Tab in dialogs on WebKit). Places with their own focus look
  (the writing, the title, text fields) skip the ring. A control that listens for keys
  after a click focuses itself and shows it's listening, since WebKit doesn't focus
  clicked buttons.
- **Accessible:** everything works by keyboard (above), controls are native elements with visible
  labels in their accessible names, shortcuts are announced and can be changed, and text meets WCAG AA
  (4.5:1) in the default looks. Colors people choose, vibe theme packs
  included, are theirs (see appearance). Muted text is soft by default (a cozy choice) and
  reaches 4.5:1 when the system asks for more contrast. Checked with axe in light and dark mode, with panels open.

## Formatting is set in one place

Text formatting is set only with the **toolbar**. A **text style** (Title, Headings, Body,
Small) takes its look from text: **Update style to match text** copies the selected text's
look into the style, so every toolbar option is a style option without a second set of
controls; **Update text to match style** does the reverse. Text's own formatting wins over
its style's, and the toolbar shows what's in effect, the style's included.

**Size is the one exception: style-only, on purpose.** Styles already give seven sizes, and
size usually means importance, which a heading also carries into markdown and screen
readers. Per-text size would be stored in entries (hard to take back) and wouldn't follow
style changes. Revisit if it's missed in practice.

## Out of scope

Sync, sharing, images or attachments in entries, page breaks and print layout (the page
scrolls endlessly).

## Storage

| `localStorage` key                 | Contents                                                            |
| ---------------------------------- | ------------------------------------------------------------------- |
| `write.entries.v2`                 | Entries, only where IndexedDB can't open (cleared once moved)       |
| `write.entriesMovedToIndexedDb.v1` | Entries moved to IndexedDB, so a journal here would be out of date  |
| `write.selectedEntryId.v1`         | Last open entry                                                     |
| `write.entrySort.v1`               | Entries list sort                                                   |
| `write.appearance.v1`              | Fonts, text styles, margins, spacing, colors, tab title, background |
| `write.settingsOpen.v1`            | Whether the settings drawer is open                                 |
| `write.settingsOpenSections.v1`    | Open settings sections                                              |
| `write.settingsClosedSections.v1`  | Folded sections from before they started folded (read once, kept)   |
| `write.sidebarWidth.v1`            | The sidebar's width, once someone resizes it                        |
| `write.exportChoices.v1`           | The Export dialog's last choices                                    |
| `write.pageThemeHistory.v1`        | Settings undo/redo, max 50 steps (older color-only history kept)    |
| `write.shortcuts.v1`               | Keyboard shortcuts changed from their defaults                      |
| `write.showShortcuts.v1`           | Whether shortcuts show beside controls, once someone chooses        |

IndexedDB `write-journal`: `entry` (one record per entry, format 2), `meta` (when entries
moved from localStorage) and `backup` (unreadable records, with when and where).
IndexedDB `write-files`: background pictures and videos, the current one's and theme packs', 250 MB together.

Bump a key's `vN` when its format changes incompatibly and migrate from the old key once.
Fields added later must load from older data without them.

## UI patterns

- **Menus** open from a toolbar or ⋯ button and share one look. No titles: a menu is named
  by its trigger; parts that could be confused get self-describing items and a divider.
  **A menu's reset is its last row** (↺ and what it resets), off while there's nothing to
  reset. "Reset" means back to defaults only; for text styles, the chosen theme pack's are
  the defaults. A pick-one menu closes on a choice; arrow
  keys preview without closing. Menus open with focus on the current choice, or on the
  panel itself when there is none, so nothing looks chosen until Tab. A row's own panel
  opens beside the row, lined up with its top.
- **Closed menus and dialogs render nothing inside.** Rendering every closed list on each
  re-render made WebKit's memory climb by hundreds of MB. Panels are anchored only while
  open: WebKit hangs when a menu closes with closed, still-anchored menus inside it.
- **Dialogs** are native `<dialog>`s and take focus themselves, so a stray Enter can't press
  anything. One you opened has a × in its top right corner and also closes on a click
  outside or Escape; one that opened by itself (Save failed) has no × and needs a button,
  so it can't be dismissed unread. Confirmations put Cancel first.
  Tab wraps through every control in every browser. No browser popups.
- **No warning colors.** People pick their own palette, and red or orange can clash or be
  unreadable on it. Destructive actions look like any other and ask first; problems are
  marked by a warning icon in the text color. Checkboxes, radios and switches are drawn in
  the text color too, since browsers fill them white.
- **Switches for settings that apply at once** (Sidebar border, Show shortcuts);
  **checkboxes for choices a form applies later** (what an export includes).
- **The sidebar never scrolls sideways**, however narrow: a setting's name gives way ("…",
  whole on hover) before its control does. Only rows meant to scroll (theme packs) do.
- **Scrolling areas fade their edges while there's more to see that way:** sideways rows
  (the toolbar, theme packs) at their ends, and the sidebar's entries list and settings
  at their top and bottom.
- **Color tiles are buttons** that open the system color picker, because WebKit never lets
  the keyboard reach color inputs. Text colors (toolbar and text styles) share one menu:
  theme tones, then seven custom slots; a filled slot's × (hover or focus) empties it.
- **Buttons have a fixed height**, never sized by what they show, so a changing icon or a
  font name drawn in its font never moves the toolbar or the page below it.
- **Number steppers** can be typed in (applied on Enter or leaving) or stepped with the
  arrows, within their range; steps land on the next multiple (55 by tens → 60 or 50).
- **Real units** where people expect them (line spacing as a multiplier, sizes in px);
  preset names where editors use them (margins).
- **Pressed and open toggles** show a see-through shade that reads the same on the page and
  the tinted sidebar. The sidebar toggle doesn't: the open sidebar shows it.
- **Secondary and destructive actions** live in a ⋯ menu at the end of their bar.
- **Keyboard shortcuts are shown beside their controls:** in the menu item, or the
  button's tooltip, so people find them where they already look. Every shortcut, including
  shortcut-only actions (Copy selection as markdown), is listed (and changeable) in the
  Keyboard shortcuts dialog (Settings › Data). Without a mouse or trackpad (phones) they're
  hidden by default, since they only take room there; a switch in that dialog overrides
  it.
- **Rows with something at the end** (a shortcut, a control) never scroll or push it out of
  view: the label is cut short with "…", and the full label shows on hover and is read in
  full.
- **No ellipses in menu titles or labels** (e.g. "Export", not "Export…"): an ellipsis
  reads as a label cut short.
- **A crash or unopenable journal** shows a message page with the error and Reload, never a
  blank page.
- **Phones and touch screens** get the same layout adapted by CSS: the toolbar scrolls
  sideways, the sidebar overlays the page on narrow screens, touch controls are 44px, hover
  styles apply only where there's hover, fields are at least 16px (no iOS zoom), safe areas
  clear the notch, and Android's keyboard shrinks the layout.

## Layout

`src/app` composes features; `src/features/*` are user-facing capabilities, each with a
`SPEC.md`; `src/journal-document`, `src/text-styles`, `src/fonts` and
`src/keyboard-shortcuts` are shared by several features; `src/design-system` holds tokens and base components; `src/lib` and `src/utils`
hold framework-free helpers.
