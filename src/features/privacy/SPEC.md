# Privacy

The welcome: what the journal is and how it keeps your writing.

## How it works

- **The copy lives in one place**, shared by the welcome entry and the About dialog: the
  intro, the privacy notes (data stays in this browser and goes with browser data, so
  export and import it; works offline once loaded; browser extensions can read every site,
  so disable them or use another profile) and the sign-off.
- **First visit:** the journal starts with a **welcome entry**, a real entry the person can
  edit or delete: the intro, the notes, a short tour that uses what it describes, and the
  sign-off. Returning visitors never get it.
- **About** (Data) shows the same intro and notes as a dialog, with a link to the source.
- **Framed by another page**, the app shows "Write opens in its own tab" with a button to
  open it, and never opens the journal.

## Decisions

- The frame check stands in for the `frame-ancestors` header, which GitHub Pages can't send
  and a `<meta>` CSP ignores. Without it, another site could disguise the app under its own
  page and trick clicks (clickjacking).
- The copy is the author's own: edit for grammar only, keeping the voice. The tour lines are
  drafts for the author to rewrite (marked in code).
- Tour shortcuts match the reader's platform.
- Kept generic: the app can't detect the browser, and the advice should suit everyone.
- If browser storage is cleared, the welcome entry comes back, which is the right moment.
- The editors opt out of Grammarly and LanguageTool, which only stops well-behaved
  writing assistants.
