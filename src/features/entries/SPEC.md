# Entries

The journal's entries: the list, the open entry, its title, storage, search, export and
import.

## The list

- Never empty: deleting the last entry replaces it with a blank one. **New entry** reuses
  an existing blank one, so repeated clicks don't pile up empties.
- **Sort** (sidebar top bar): Newest first (default), Oldest first, Last edited (the list
  then shows "Edited <date>"), or Name A–Z (natural order, ignoring case and accents;
  unnamed last). The order holds after every change, so the list, keyboard order and what
  opens after a delete agree.
- **Names:** the custom title if set, else the first non-empty line, else "Untitled".
- **Opening** an entry selects it at once and opens it once its writing loads; the previous
  one stays meanwhile. If it can't be read, the selection goes back and a toast says so.
- **Renaming:** clicking the open entry turns its name into a field in place (nothing
  shifts). Enter or clicking away saves, Escape cancels. Blank clears the custom title;
  saving the first line unchanged keeps following the first line. Trimmed, max 200
  characters.
- **Each row has the open entry's ⋯ menu** (copy entry as markdown, export, import, delete),
  shown on hover, focus or while open (always on touch). Delete always confirms; deleting
  another entry keeps the open one open; deleting the open one opens the one that took its
  place.
- **Search** filters as you type by name and text, ignoring case and accents; every word
  must match, in any order. Matches are highlighted, with a snippet in place of the date
  when the match is in the text. The count is announced. Escape clears; a new entry clears
  the search (it wouldn't match). While focused, the field takes the whole bar.

## The title

The entry's name sits above the writing in the Title style. It's a one-line editor with the
writing's toolbar (no blocks), editing the same name as the sidebar. Enter or ↓ at the end
moves into the writing; pasted line breaks become spaces. Its plain text names the entry
everywhere; its styling is dropped if invalid or if the text changed elsewhere.

## Storage

- **Only storage holds every entry's writing.** The app keeps summaries (name, dates, first
  line); actions that need writing (export, copy, search) read it from storage when they
  run, and typing redraws only the open entry's row. This keeps large journals fast.
- Entries live in IndexedDB, one record per entry. Each change is written straight away,
  one write at a time, with changes made meanwhile combined into the next. A change stays
  pending until written and every read includes pending changes, so exports always have the
  latest writing. A failed write retries with the next change.
- **Save failed:** if saving entries or settings fails (e.g. storage is full), a dialog says
  so and offers every export. Dismissed, it stays closed for that run of failures, and
  closes itself with a "saving again" toast once every save works. Each saver reports on
  its own, so one working save can't hide another failing.
- **Moving from localStorage:** the first load with IndexedDB copies the old journal over
  once (copy and marker in one transaction, so never repeated or half done), then clears it
  from localStorage, backing up anything unreadable first. Where IndexedDB can't open
  (strict privacy settings), entries stay in localStorage. If it can't open after the move,
  the localStorage copy is stale, so the app says "Your journal couldn't open" with Reload
  and saves nothing.
- **Format 2** reserves `#` for titles. Format 1 data is migrated once: an untitled entry
  starting with a `#` heading gets it as its title, other headings move down a level.
  Fields added later (e.g. `title`) load as empty from older data.

## Export and import

- **⌘S** saves the open entry as JSON; **⇧⌘S** (also ⇧⌘E, unlisted) opens Export; **⌘O**
  opens Import. They replace the browser's save page and open file.
- **Export** offers Journal and/or Settings, as JSON or Markdown. JSON can hold both in one
  file (a full backup). Markdown is for reading elsewhere, so it holds only the journal.
  Choices are remembered (first time: everything as JSON). Tab then Enter exports.
- **Markdown** is one file, oldest first so it reads like a journal: each entry's name as
  `#`, an italic line saying when it was written, `---` between entries; empty entries left
  out.
- **Saving** asks where with the system Save dialog where it exists; elsewhere (Safari,
  Firefox) it downloads and the toast says so.
- **JSON carries the pictures** the exported entries show (those on this device), so a
  backup restores them; the journal is read once the Save dialog is open, since pictures
  can take a while.
- **Import is untrusted and all-or-nothing:** read locally, every entry validated against
  the document schema and every picture against its content name; one bad entry or
  picture rejects the file. No cap on size or entries: whatever exports, imports. It never replaces or deletes: entries already in the journal (same title and
  content, formatting included) are skipped, a taken id gets a new one, so importing twice
  changes nothing. Attached settings apply only once the whole file proves valid.
- Results and errors are reported in a toast.
