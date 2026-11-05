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
  text field (prefilled and selected). Enter or clicking away saves, Escape cancels.
  Saving blank clears the custom title. Saving the first line unchanged keeps following
  the first line instead of freezing it. Titles are trimmed and capped at 200 characters.
- Entries and the selected id are persisted to `localStorage` on every change.

## Data

- `title` was added after launch. Older stored entries and exports have no `title` key; it
  loads as null (no migration rewrite needed). A malformed title also becomes null rather
  than rejecting the entry.

## Rules and edge cases

- **New entry** reuses an existing blank entry instead of creating another, so repeated
  clicks don't pile up empties.
- Deleting the open entry selects the one that took its place in the list.
- Delete lives in the ⋯ menu and asks for confirmation.
- Import never replaces or deletes anything. An imported entry whose title and content
  (including formatting) already exist in the journal is skipped; otherwise it is added,
  with a new id if its id is taken. So importing the same file twice is a no-op.
- If stored entries fail validation they are backed up (see root `SPEC.md`) and the app
  starts with one blank entry.

## Export / import

- One JSON format for a single entry or the whole journal:
  `{ format: 'write-journal', version: 1, exportedAt, entries: JournalEntry[] }`.
  Export entry / import live in the ⋯ entry menu; export all / import in the sidebar menu.
- Files are read locally (never uploaded) and treated as untrusted: capped at 20 MB and
  10,000 entries, checked with zod, and each entry's content is validated against the
  document schema and rebuilt from it (`journal-document`). One invalid entry rejects the
  whole file, so imports are all-or-nothing.
- **Export asks where to save** using the system Save dialog, with a suggested file name;
  cancelling saves nothing. Browsers without that dialog (Safari, Firefox) download
  instead, and the toast says the file went to the Downloads folder (`lib/saveFile.ts`).
- Results and errors are reported in a toast.
