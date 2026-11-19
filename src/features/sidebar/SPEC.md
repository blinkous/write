# Sidebar

The sidebar's width: the divider on its edge resizes it.

## How it works

- **Drag the divider** on the sidebar's edge; its line shows on hover and while dragging,
  and it gets the focus ring with the keyboard. Double-click puts the default width back.
- **By keyboard** it's a focusable divider (a WAI-ARIA window splitter): ←/→ make it a step
  narrower or wider, Home/End the narrowest or widest, then Enter or Escape when done, which returns
  focus to the writing (not nowhere, so the next Tab doesn't start over). Screen readers
  hear its width.
- **Limits:** from 14 to 28 times the text size (default 16), and never more than 40% of the
  window, so the page keeps room. A window made smaller narrows it to fit.
- **Remembered on this device,** not in settings backups (screens differ). **Reset all
  settings and styles** puts the default back.
- **Narrow screens** (where the sidebar slides over the page) have no divider and use the
  default width.

## Decisions

- Widths are in rem, so a chosen width grows with the text size like the rest of the
  layout.
- A drag follows the pointer smoothly and is saved once it ends; arrow keys move a whole
  step.
