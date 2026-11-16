# Privacy

The welcome: what the journal is and how it keeps your writing.

## How it works

- `privacyNotes.ts` holds the author's copy: the title ("Welcome!"), intro, the privacy notes
  (data is stored only in this browser and cleared with browser data, so export it and import
  it back; works offline once loaded; browser extensions may read data on all sites, so
  disable them or use another profile or browser) and the sign-off ("Write away!"). The
  dialog and the welcome entry both use it, so the wording lives in one place.
- **First visit** (`isFirstVisit`, no `write.privacyNoticeSeen.v1` key): the journal starts
  with the **welcome entry** (`welcomeEntry.ts`), a real entry the person can edit or delete:
  the intro, the privacy notes as a list, a quick tour that uses what it describes (title,
  headings, lists, code), and the sign-off. The visit is then remembered. Returning visitors,
  including anyone who saw the old welcome dialog, never get it.
- **About** (settings drawer → Data) opens `PrivacyNotice`, a dialog with the same intro and the notes
  as icon rows (each sentence on its own line, icons centered on their note). Closing it
  returns focus to the entry.

- **Framed by another page** (`isFramed`), `main.tsx` shows `FramedNotice` ("Write opens in
  its own tab", with a button to open it there) and never opens the journal.

## Decisions

- The frame check stands in for the `frame-ancestors` header, which static hosts like GitHub
  Pages can't send and a `<meta>` CSP ignores. Without it, another site could show the app
  disguised under its own page and trick clicks (clickjacking).

- The copy is the author's own; edits are for grammar only, keeping the voice. The tour lines
  and the welcome entry's two headings are drafts for the author to rewrite (marked in code).
- Shortcuts in the tour come from `utils/shortcuts.ts`, so they match the reader's platform.
- Kept generic: the app can't detect the browser, and the advice should suit everyone.
- If browser storage is cleared, the welcome entry comes back, which is the right moment for it.
- The editors carry Grammarly/LanguageTool opt-out attributes (`lib/writingAssistants.ts`).
  They only stop well-behaved writing assistants.
