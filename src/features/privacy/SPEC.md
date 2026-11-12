# Privacy

The welcome note: what the journal is and how it keeps your writing.

## How it works

- `PrivacyNotice` is one dialog, "Welcome!": the author's intro (what this is and why), then
  three icon notes (data is
  stored only in this browser, cleared with browser data, so export it and import it back;
  works offline once loaded; browser extensions may read data on all sites, so disable them
  or use another profile or browser for full privacy).
  Each sentence sits on its own line; icons center vertically on their note.
- It opens by itself on a fresh browser (no `write.privacyNoticeSeen.v1` key) and is marked
  seen when closed ("Write away!" or Escape), then focus goes to the entry, ready to
  type. The sidebar ⋯ menu → About reopens the same dialog.

## Decisions

- The copy is the author's own; edits are for grammar only, keeping the voice.
- Kept generic: the app can't detect the browser, and the advice should suit everyone.
- If browser storage is cleared, the welcome reappears, which is the right moment for it.
- The editor carries Grammarly/LanguageTool opt-out attributes (editor feature). They only
  stop well-behaved writing assistants.
