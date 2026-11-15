# Entries

The list of journal entries and which one is open.

## How it works

- **Only storage holds every entry's writing.** The journal (`journal.ts`, opened in
  `main.tsx` before the first render) knows the list's order, a summary of each entry
  (`EntrySummary`: everything but the writing, plus the first line), which entry is
  selected, and which is open. The editor holds the open entry's writing. Actions that need
  writing (export, copy, import, search) read it from storage when they run
  (`getEntry`, `getAllEntries`).
- **Renders follow what they show** (`useJournalState`, `useEntrySummary`): the list follows
  the order, each row its own entry, the app the open entry and the sort. Typing redraws
  only the open entry's row.
- **Opening an entry:** choosing one selects it at once (the list shows it); it opens once
  its writing has loaded, the previous one staying in the editor meanwhile. If it can't be
  read, the selection goes back and a toast says so. New and imported entries open straight
  away, their writing already at hand.
- Entries are always sorted newest first and the list is never empty: deleting the last
  entry replaces it with a blank one.
- An entry's name is its custom `title` if set, otherwise its first non-empty line of
  text, otherwise "Untitled".
- **Renaming:** clicking an entry opens it; clicking the open entry turns its name into a
  text field in place: same font and position, so nothing shifts, with the cursor at the
  end and an underline (drawn inside the field) to show it's being edited. Enter or clicking away saves, Escape cancels.
  Saving blank clears the custom title. Saving the first line unchanged keeps following
  the first line instead of freezing it. Titles are trimmed and capped at 200 characters.
- **Storage** (`entryStore.ts`): entries live in IndexedDB (`entryDatabase.ts`, database
  `write-journal`), one record per entry, read and validated at startup (records that fail
  validation move to the `backup` store, never dropped). Each change is written straight
  away as a change to its own entry (`databaseEntryStore.ts`; a rename keeps the stored
  writing, an edit the stored name), one transaction at a time, with changes made meanwhile
  combined into the next (`pendingEntryWrites.ts`). A change stays pending until its write
  succeeds, and every read includes what's pending, so exports always have the latest
  writing. A failed write is reported (Save failed) and written again with the next change.
  The selected id and sort stay in `localStorage`.
- **The move from localStorage:** on the first load with IndexedDB, the localStorage journal
  (`write.entries.v2`, or v1 migrated) is copied over once: the copy and a marker in `meta`
  are written in one transaction, so it's never repeated or half done, and
  `write.entriesMovedToIndexedDb.v1` records the move. Then, on every load, the journal is
  cleared out of localStorage (v1, v2 and their `.backup.` keys): anything unreadable (a
  backup, a journal failing validation) is first added to the `backup` store, with its key as
  the source, so no writing is lost; readable copies are already in the database.
  Where IndexedDB can't open (some strict privacy settings), entries stay in localStorage as
  before, held whole and written whole on each change (`createMemoryEntryStore`). If it can't open after the move, the localStorage copy is out of date, so instead of
  showing it the app shows `JournalUnavailable` ("Your journal couldn’t open", with Reload)
  and saves nothing.
- If saving the
  entries or the settings (appearance, sort) fails (e.g. storage is full), `SaveFailedDialog`
  says so and offers every export (JSON, markdown, settings) beside Dismiss. It opens by itself,
  often mid-typing, so focus goes to the dialog rather than a button: a stray Enter or Space
  can't dismiss it unread. Each saver reports
  to `lib/saveStatus` under its own name, so one working save doesn't hide another failing.
  Dismissed, it stays closed for that run of failures (each run gets a number from
  `lib/saveStatus`, read with `useSyncExternalStore`); it closes by itself with a "saving
  again" toast once every save works.
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
- **⌘S** (`useFileShortcuts`) saves a JSON backup of the open entry via the Save dialog;
  **⇧⌘S** opens Export (below), its Export button focused so Enter saves; **⌘O** opens
  Import's file picker (`ImportFilePicker`, the app's one import picker, which the Import
  rows open too: it's always mounted, unlike menus' contents). They replace the browser's "save page" and "open file"; the menus show the
  shortcuts.
- **Row ⋯ menu:** each entry in the list has the same ⋯ menu as the open entry (copy as
  markdown, export, import, delete), acting on that entry and named "Actions for <name>". It
  shows on hover, keyboard focus or while open (always on touch screens), and the name makes
  room for it. Delete always confirms first; deleting another entry keeps the open one open.
- **Sort** (`entrySort.ts`, `EntrySortMenu`: the sort icon in the sidebar's top bar, a
  pick-one menu): Newest first (default), Oldest
  first, Last edited (by `updatedAt`, which edits and renames set; the list then shows "Edited
  <date>"), or Name A–Z (natural order, ignoring case and accents; unnamed entries last). The
  journal keeps entries in the chosen order after every change, so the list, keyboard order
  and "what opens after a delete" all agree. Stored under `write.entrySort.v1`.
- **First entry:** `openJournal` takes `createFirstEntry` for an empty journal (the app passes
  the welcome entry on a first visit); otherwise a blank entry.
- **Search** (`entrySearch.ts`, the field at the top of the sidebar) filters entries as you
  type by name and text, ignoring case and accents; every word must match, in any order.
  Each change of the query reads the entries from storage (`useEntrySearch`).
  Matches are highlighted; when the match is in the text rather than the name, a snippet
  around it replaces the date. Escape clears; creating an entry clears the search (a new
  empty entry wouldn't match). The result count is announced for screen readers. While
  focused, the field grows to take the whole bar (the buttons beside it slide away; instant
  with reduced motion) and shows a small ×
  that clears and steps out; leaving the field brings the buttons back and keeps the search.

## Data

- **Format 2** (each IndexedDB record, the old storage key `write.entries.v2`, export `version: 2`) reserves `#` headings for
  entry titles. Format 1 data (key `write.entries.v1`, export `version: 1`) is migrated by
  `migrateEntryFromFormat1`: an untitled entry starting with a `#` heading gets it as its
  title; all other headings move down a level. Stored v1 data is migrated once (only when v2
  doesn't exist yet); v1 files are migrated on import.

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
  `{ format: 'write-journal', version: 2, exportedAt, entries: JournalEntry[], settings? }`.
  `settings` (opaque here; written and read by the settings feature) makes one file a full
  backup. Older versions ignore it and import the entries. On import, attached settings are
  applied only once the whole file has proved valid, and the toast says so ("Settings
  imported too.", or why they were skipped).
  The entry ⋯ menu has copy as markdown, export entry, import and delete. The settings
  drawer's **Data** section (`DataSettings`) has **Export…**, import (journal backups or
  settings files; see settings `SPEC.md`), and About.
- **Export…** opens `ExportDialog`: two columns (stacking when narrow), **Include** Journal
  and/or Settings (checkboxes) and **Format** JSON or Markdown (radios), then Cancel | Export. JSON saves the journal with its
  settings in one file, or just one of them (settings alone save a settings file). Markdown
  is for reading the writing elsewhere, so it holds only the journal: Settings turns off,
  with "Settings export as JSON only.". Export is off while nothing is included. The choices
  are remembered (`exportChoices.ts`); the first time, everything as JSON.
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
