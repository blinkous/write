# Write

A minimal, private web journal: a clean writing page with adjustable font, size, margins,
spacing and colors, per-text color, glow and case, and export as markdown or JSON.

## Hard rules

- **Local only.** All data lives in the browser: entries in IndexedDB (see entries
  `SPEC.md`), files in IndexedDB too (the background picture or video, `src/lib/blobStore.ts`),
  and settings in `localStorage`. No accounts, servers or analytics.
- **No network at runtime.** Fonts are open-licensed Google Fonts bundled via Fontsource,
  so the app works offline.
- **Locked-down origin.** Builds ship a Content Security Policy (`vite.config.ts`) allowing
  only the app's own scripts, styles and fonts and no network connections, so injected
  content can't read the journal or send it anywhere. Nothing may need inline scripts or
  styles, or `data:` fonts (e.g. Tiptap's CSS is vendored, fonts are never inlined).
  Pictures and videos may be `blob:` URLs: the background, read from IndexedDB. The app
  also refuses to run inside another page's frame (see privacy `SPEC.md`).
- **License notices ship with the app.** Builds include `THIRD_PARTY_LICENSES.txt` with the
  license and copyright of every production dependency (fonts included), generated from
  `package.json` (`vite.config.ts`).
- **Dedicated origin.** Browser storage is per origin, so the app gets one to itself: a
  shared or shifting one would share or "lose" entries. Locally it always runs on
  `localhost:4791` (`strictPort`); hosted, on its own subdomain, `write.dhani.dev`.
- **Deploys** come from `.github/workflows/ci.yml`: every push and pull request runs
  `npm run check` and builds; pushes to `main` then publish `dist/` to GitHub Pages.
- **Never silently lose writing.** Stored entries that fail validation are kept in the
  journal database's `backup` store, never dropped (where IndexedDB can't open, under a
  timestamped `.backup.` localStorage key; see `src/lib/localStore.ts`), and a failed save is
  announced, never ignored.
- **Imports are untrusted.** Validated against a strict format and the document schema,
  all-or-nothing, and never overwrite existing writing (see entries `SPEC.md`).
- Accessible: everything works by keyboard, controls are native elements with labels, and
  text meets WCAG AA contrast (4.5:1). Muted text is soft by default (a cozy choice) and
  becomes 4.5:1 when the system asks for more contrast. Checked with axe-core in light
  and dark mode, with the drawer, menus and dialogs open. Visible labels are part of each
  control's accessible name; shortcuts are given as `aria-keyshortcuts`. Disabled controls
  don't react to hover. Pressed toggles (bold, italic) and the settings ⚙ while its drawer is open show as on: a
  see-through shade (`--color-shade`) that reads the same on the page and the tinted
  sidebar (the ⚙'s fades unless motion is reduced). The sidebar toggle doesn't
  (`plainWhenExpanded`): the open sidebar shows it, as in most apps. Both keep
  `aria-expanded`.

## Formatting is set in one place

Text formatting is set only with the **toolbar** (applied to the selected text, stored in the
entry). A **text style** (Title, Heading, Body or Small, applied to all its text) takes its
look from text: **Update style to match text** in the style's ⋯ (the style menu) makes the
style look like the selected text, so every toolbar option is a style option too, with no
second set of controls; **Update text to match style** does the reverse. Text's own formatting wins over its style's, and the toolbar always
shows what's in effect, the style's included (see the editor's SPEC).

**The one exception is size, which is style-only, on purpose** (set in the style's ⋯). Changing the text style
(Small, Body, Headings, Title) already gives seven sizes, and size usually stands for
importance, which a heading also carries into markdown and screen readers. Per-text size
would also be stored in entries (hard to take back) and wouldn't follow later style changes.
Revisit it if it's missed in practice.

## Out of scope

Sync, sharing, images/attachments in entries, page breaks / print layout (the page scrolls endlessly).

## Storage keys

| Key                                | Owner      | Contents                                                                     |
| ---------------------------------- | ---------- | ---------------------------------------------------------------------------- |
| `write.entries.v2`                 | entries    | Journal entries, only where IndexedDB can't open (cleared once moved)        |
| `write.entriesMovedToIndexedDb.v1` | entries    | The entries moved to IndexedDB, so a journal here would be out of date       |
| `write.selectedEntryId.v1`         | entries    | Last open entry id                                                           |
| `write.entrySort.v1`               | entries    | How the entries list is sorted                                               |
| `write.appearance.v1`              | appearance | Fonts, margins, spacing, colors, journal name, background blur/opacity       |
| `write.settingsOpen.v1`            | settings   | Whether the settings drawer is open                                          |
| `write.settingsOpenSections.v1`    | settings   | Open settings sections, by id (all start folded)                             |
| `write.settingsClosedSections.v1`  | settings   | Folded sections, from before they started folded (read once, kept as backup) |
| `write.exportChoices.v1`           | entries    | The Export dialog's last choices (journal, settings, format)                 |
| `write.pageThemeHistory.v1`        | appearance | Page theme undo/redo steps, max 50 (color-only v1 history kept as a backup)  |
| `write.privacyNoticeSeen.v1`       | privacy    | This browser has visited (no welcome entry)                                  |

IndexedDB database `write-journal` (entries; see entries `SPEC.md`):

| Store    | Key            | Contents                                                               |
| -------- | -------------- | ---------------------------------------------------------------------- |
| `entry`  | entry id       | One journal entry (format 2)                                           |
| `meta`   | name           | `movedFromLocalStorageAt`: when entries moved from localStorage        |
| `backup` | auto-increment | Unreadable entry records or localStorage journals, with when and where |

IndexedDB database `write-files`, store `files`:

| Key                   | Owner      | Contents                                                              |
| --------------------- | ---------- | --------------------------------------------------------------------- |
| `background-media.v1` | appearance | The background picture, GIF or video (its bytes and type, max 100 MB) |

Bump the `vN` suffix if a format changes incompatibly, migrating from the old key once (see
entries `SPEC.md`). Fields added later must load from
older data without them (see the storage tests).

## UI patterns

- **Menus** open from a toolbar or ⋯ button and share one look: the `Popover` panel, rows
  from `MenuItem` (actions) or `ChoiceGroup` (pick one), swatch sections in `PopoverPanel`,
  and `Divider` between sections. Same padding, row height, hover and selected states.
  **A menu's reset is its last row**: ↺ and what it resets (e.g. "Reset style"), off while
  there's nothing to reset. "Reset" means back to defaults only; bringing text in line with
  its style is "Update text to match style".
  A menu that is a single pick-one list closes once a choice is made (click, Enter, Space);
  arrow keys preview without closing. Menus open with focus on the current choice; without one (action menus,
  panels) the panel itself takes focus, so nothing looks chosen until Tab.
  Panels open below their trigger, or beside it for a row's own action that opens a panel
  (`MenuActionRow`, e.g. editing a text style from the style menu), lined up with its top so
  the rows below stay visible.
  Panels are anchored to their trigger only while open: WebKit (Safari, DuckDuckGo) hangs
  when a menu closes with closed, still-anchored menus nested inside it.
  Closed menus and dialogs render nothing inside (`Popover`, `Dialog`): rendering every
  closed font list and swatch grid whenever the app re-rendered made WebKit's memory climb
  by hundreds of MB. Typing re-renders only what shows the writing (see the entries spec's
  journal). Anything that must outlive its menu (e.g. the
  import file picker, `ImportFilePicker`) lives outside it.
- **The settings drawer** (design-system `Drawer`) is for settings browsed together: it
  slides up from the bottom of the sidebar, stays open until toggled, and shares the space
  with the entries (both stay usable). Sections are `DrawerSection`s (foldable, chevron down to unfold
  and up to fold). Settings rows are `LabeledRow`s: the name on the left, the control at the
  end (a menu button, text editable in place, a stepper or a swatch tile), its text lined up
  with the row's edge; menu triggers showing text (e.g. "Lora ⌄") and
  editable text are padded like an icon button's inset (`--space-trigger-inline`), so every
  control's content sits equally far in, toolbars space selects and icons alike, and one pull
  lines every row's content up with the edge. Swatch tiles are outlined in the muted color (like section titles), so a
  tile matching the page still shows its edge. Color tiles are buttons that open the system
  color picker (a hidden color input), since WebKit never lets the keyboard reach color inputs. Action rows are `MenuItem`s. Quick, single-purpose choices stay in menus.
- **Text colors** are picked from one menu (`ColorMenu`): text color (toolbar) and each
  text style's color. A row of theme tones, then the custom colors, shared by both. Custom
  slots open the system color picker (a hidden color input under a button, since WebKit
  never lets the keyboard reach color inputs). A filled slot's × (on hover or focus)
  removes it without applying it. The page's Foreground and Background are tiles that
  open the system color picker directly (see appearance `SPEC.md`).
- **Messages in place of the app** (e.g. the journal couldn't open, or the app crashed: an
  error boundary around it in `main.tsx` shows `AppCrashed` with the error's message and
  Reload, never a blank page) use `MessagePage`, laid
  out like a dialog: a `MessageTitle`, then text and actions.
- **Dialogs** use the design-system `Dialog` (native `<dialog>`: focus trap, Escape, focus
  return) e.g. the welcome/privacy notice. A dialog you opened closes on a click outside,
  like Escape or Cancel; one that opened by itself (`opensUnprompted`, e.g. Save failed)
  needs a button, so a stray click can't dismiss it unread. Confirmations use
  `ConfirmDialog` (Cancel first, so the first Tab lands on it, not the action). No browser popups.
  Every dialog takes focus itself on open, not its first button: nothing looks chosen until
  Tab, and a stray Enter can't press anything. Inside a dialog, Tab and Shift+Tab step
  through every control and wrap at the ends, in every browser (Safari's plain Tab would
  otherwise skip buttons and checkboxes, leaving nothing to land on). A dialog can name
  where the first Tab lands (`firstTabStopRef`), e.g. Export's main action.
- **No warning colors.** People pick their own palette, and a red or orange can clash with
  it or be unreadable on it. Destructive actions look like any other and ask first;
  something gone wrong (a failed save, a toast about a bad file) is marked by `WarningIcon`,
  drawn in the text color, so the shape is the signal.
  Choices inside a dialog are native checkboxes and radios, stacked in a
  labeled group (`ChoiceFieldset`, `Checkbox`, `RadioGroup`), drawn by the app rather than
  the browser: an outline in the text color over whatever's behind (browsers fill them
  white, which clashes with colorful themes), filled with it when checked. Menus keep their
  own rows (`ChoiceGroup`).
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
  (written as rem, so browser zoom still works), set per text style from the style menu.
- **Secondary and destructive actions** live in a ⋯ menu at the end of their bar.
- **Phones and touch screens** get the same layout, adapted by CSS rather than separate
  screens: the toolbar scrolls sideways at the top, the sidebar overlays the page below
  48rem, and on touch screens (`pointer: coarse`) controls are 44px and swatch menus widen
  so tiles are too. Hover styles apply only where there's hover (`hover: hover`), since a
  tap would leave them stuck. Fields are at
  least 16px, so iOS doesn't zoom in on focus. The page reaches under a phone's notch and
  home indicator (`viewport-fit=cover`), with safe-area padding keeping controls clear;
  on Android the keyboard shrinks the layout (`interactive-widget=resizes-content`).

## Layout

`src/app` composes features; `src/features/*` own user-facing capabilities, each with a
`SPEC.md`; `src/journal-document` is the document schema shared by editor and entries;
`src/design-system` holds tokens and base components; `src/lib` and `src/utils`
hold framework-free helpers.
