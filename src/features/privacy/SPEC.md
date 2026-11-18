# Privacy

About: what the journal is and how it keeps your writing.

## How it works

- **About** (Data) is a dialog with the intro, the privacy notes (data stays in this
  browser and goes with browser data, so export and import it; works offline once loaded;
  browser extensions can read every site, so disable them or use another profile), the
  sign-off and a link to the source.
- **Framed by another page**, the app shows "Write opens in its own tab" with a button to
  open it, and never opens the journal.

## Decisions

- The frame check stands in for the `frame-ancestors` header, which GitHub Pages can't send
  and a `<meta>` CSP ignores. Without it, another site could disguise the app under its own
  page and trick clicks (clickjacking).
- The copy is the author's own: edit for grammar only, keeping the voice.
- No welcome entry or tour: a first visit opens straight onto a blank page, and the app
  is meant to be self-explanatory.
- Kept generic: the app can't detect the browser, and the advice should suit everyone.
- The editors opt out of Grammarly and LanguageTool, which only stops well-behaved
  writing assistants.
