# Entries

The list of journal entries and which one is open.

## How it works

- State is managed by a pure reducer (`entriesReducer.ts`); ids and timestamps are created
  outside it and passed in actions.
- Entries are always sorted newest first and the list is never empty: deleting the last
  entry replaces it with a blank one.
- An entry's name is its custom `title` if set, otherwise its first non-empty line of
  text, otherwise "Untitled".
- **Renaming:** clicking an entry opens it; clicking the open entry turns its name into a
  text field in place: same font and position, so nothing shifts, with the cursor at the
  end and an underline (drawn inside the field) to show it's being edited. Enter or clicking away saves, Escape cancels.
  Saving blank clears the custom title. Saving the first line unchanged keeps following
  the first line instead of freezing it. Titles are trimmed and capped at 200 characters.
- Entries and the selected id are persisted to `localStorage` on every change.
- **Title on the page** (`EntryTitleField`, `useTitleEditor`): the entry's name sits above
  the writing in the title style and scrolls with it. It's a one-line editor
  (`journal-document/titleExtensions.ts`) styled with the same toolbar as the writing: bold,
  italic, underline, strike, color, font and case (no blocks). It edits the same name as the
  sidebar, trimmed when stored. Enter or ↓ at the end moves into the writing; pasted line
  breaks become spaces (`titleBehavior.ts`). Blank means the first line names the entry.
- **Title data:** `title` is the plain text (used by the sidebar, search, file names and
  markdown); `titleContent` holds the styled title document, or null when nothing is styled.
  Styling that's invalid or whose text no longer matches `title` is dropped on load and
  import; a sidebar rename that changes the text clears it.
- **⌘S / ⇧⌘S** (`useExportShortcuts`) save a JSON backup of the open entry / all entries via
  the Save dialog, replacing the browser's "save page"; the menus show the shortcuts.
- **Row ⋯ menu:** each entry in the list has the same ⋯ menu as the open entry (copy as
  markdown, export, import, delete), acting on that entry and named "Actions for <name>". It
  shows on hover, keyboard focus or while open (always on touch screens), and the name makes
  room for it. Delete always confirms first; deleting another entry keeps the open one open.
- **Sort** (`entrySort.ts`, `EntrySortMenu`: the sort icon in the sidebar's top bar, a
  pick-one menu): Newest first (default), Oldest
  first, Last edited (by `updatedAt`, which edits and renames set; the list then shows "Edited
  <date>"), or Name A–Z (natural order, ignoring case and accents; unnamed entries last). The
  reducer keeps entries in the chosen order after every change, so the list, keyboard order
  and "what opens after a delete" all agree. Stored under `write.entrySort.v1`.
- **First entry:** `useEntries` takes `createFirstEntry` for an empty journal (the app passes
  the welcome entry on a first visit); otherwise a blank entry.
- **Search** (`entrySearch.ts`, the field at the top of the sidebar) filters entries as you
  type by name and text, ignoring case and accents; every word must match, in any order.
  Matches are highlighted; when the match is in the text rather than the name, a snippet
  around it replaces the date. Escape clears; creating an entry clears the search (a new
  empty entry wouldn't match). The result count is announced for screen readers. While
  focused, the field grows to take the whole bar (the buttons beside it slide away; instant
  with reduced motion) and shows a small ×
  that clears and steps out; leaving the field brings the buttons back and keeps the search.

## Data

- **Format 2** (storage key `write.entries.v2`, export `version: 2`) reserves `#` headings for
  entry titles. Format 1 data (key `write.entries.v1`, export `version: 1`) is migrated by
  `migrateEntryFromFormat1`: an untitled entry starting with a `#` heading gets it as its
  title; all other headings move down a level. Stored v1 data is migrated once (only when v2
  doesn't exist yet) and left in place as a backup; v1 files are migrated on import.

- `title` was added after launch. Older stored entries and exports have no `title` key; it
  loads as null (no migration rewrite needed). A malformed title also becomes null rather
  than rejecting the entry.

## Rules and edge cases

- **New entry** reuses an existing blank entry instead of creating another, so repeated
  clicks don't pile up empties.
- Deleting the open entry selects the one that took its place in the list.
- Delete lives in the ⋯ menu and asks for confirmation in a `ConfirmDialog` (Cancel focused
  first; Escape cancels).
- Import never replaces or deletes anything. An imported entry whose title and content
  (including formatting) already exist in the journal is skipped; otherwise it is added,
  with a new id if its id is taken. So importing the same file twice is a no-op.
- If stored entries fail validation they are backed up (see root `SPEC.md`) and the app
  starts with one blank entry.

## Export / import

- One JSON format for a single entry or the whole journal:
  `{ format: 'write-journal', version: 2, exportedAt, entries: JournalEntry[] }`.
  The entry ⋯ menu has copy as markdown, export entry, import and delete. The settings
  drawer's **Data** section (`DataSettings`) has export all (JSON or markdown), import, and
  About. Its labels are short to fit the sidebar ("Export as JSON"), with the full action
  as the accessible name.
- **Export all as markdown** (`journalMarkdown.ts`) writes one `.md` file, oldest first so it
  reads like a journal: each entry starts with its custom name as `#` (headings shifted down
  a level, as for Copy as markdown) and an italic line saying when it was written; entries
  are separated by `---`; empty entries are left out. The editor supplies the markdown
  conversion, so the format rules live in one place.
- Files are read locally (never uploaded) and treated as untrusted: capped at 20 MB and
  10,000 entries, checked with zod, and each entry's content is validated against the
  document schema and rebuilt from it (`journal-document`). One invalid entry rejects the
  whole file, so imports are all-or-nothing.
- **Export asks where to save** using the system Save dialog, with a suggested file name;
  cancelling saves nothing. Browsers without that dialog (Safari, Firefox) download
  instead, and the toast says the file went to the Downloads folder (`lib/saveFile.ts`).
- Results and errors are reported in a toast.
