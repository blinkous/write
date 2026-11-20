# Journal images

Pictures in entries: kept in this browser's own storage, never fetched from anywhere.

## How it works

- **Formats:** PNG, JPEG, GIF, WebP and AVIF, up to 20 MB each. GIFs play, and can be paused (see editor). SVG is left out.
- **Named by content:** a picture's name is its SHA-256 plus its format's extension, so the
  same picture is kept once however many entries (or copies) show it, and a name always
  means the same picture.
- **Room:** pictures are writing, so they don't count toward the backgrounds' 250 MB; the
  browser's own storage is the limit, and a picture that can't be saved says so.
- **Freed when unused:** as the journal opens, pictures no entry shows are deleted. Never
  mid-session, so undo can always bring one back, and never one added since the app opened
  (its entry may not be saved yet).
- **Restoring** (from a backup) keeps a picture only if its bytes match its name.

## Decisions

- Documents store the name, never a URL: a URL would either need the network or point at
  something that vanishes on reload (`blob:`).
