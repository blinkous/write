# Appearance

The page-wide look: fonts, text styles, margins, spacing, colors, the tab title and the
background picture or video, with one shared undo/redo.

## Settings

- **Theme:** the theme packs, the interface font (default Inter), then the page colors,
  **Foreground** (the default text color, named so it isn't mistaken for a text setting)
  and **Background**, with the background picture or video.
- **Editor:** the **Default font** (default Lora), the base for every text style, then
  **Reset text styles**. Text styles themselves are edited from the toolbar's style menu
  (see editor).
- **Data:** the **tab title** ("Write" while empty, up to 60 characters).
- **Toolbar:** **Margins** (Wide, Normal, Narrow, None) and **Spacing**: line spacing as
  multipliers (1.4 default, 1.7, 2.0, 2.4), then Add/Remove paragraph gap (a half line, off
  by default) and Add/Remove paragraph indent (book-style, on paragraphs that follow a
  paragraph).
- **Custom colors:** seven slots shared by every color menu (the toolbar's and the page
  colors), kept here so they persist.

## Theme packs

- Curated looks in a sideways-scrolling row of tiles at the top of Theme: the default
  light and dark looks (the first-visit colors with default fonts and styles), Blinkous
  (white neon glowing red on a moody teal sign), Unicorn (soft pastel rainbow), Cochineal
  (carmine red, named for the insect the dye comes from). Ordered by page color, lightest first, so the row reads as one gradient.
- **Only Blinkous glows:** glow is its neon-sign look; the other packs stay flat.
- **Named only in tooltips** and for screen readers; the tiles are the vibe. Each is a
  little page in the pack's background color showing "Aa" in its title style (font,
  color, glow, case) and dots of its text color, then its glows, then its style colors.
- **Choosing one replaces the whole look:** page colors, the interface and default fonts,
  and every text style, as one undo step. Custom color slots, margins, spacing, the tab
  title and the background picture stay.
- A tile shows as chosen only while the settings are exactly its look; after any edit,
  none does. Packs aren't stored: choosing one just sets those settings.
- **Readable baselines:** the default packs keep every text color at
  4.5:1 (tested), since people rely on them to read comfortably. The others are vibes,
  chosen on sight like any color someone picks, and may be as soft as their look asks.
- Colors are fixed values, so a tile previews exactly what it applies.

## Rules

- **Margins** set both a page width (decides on wide windows) and a share of the room
  (decides on phones), whichever is smaller, so each margin looks different at any size.
- **Colors apply instantly**, without transitions, so the page doesn't lag behind the
  sidebar while dragging a picker.
- **Transparency:** every color can be see-through except the page background, which has
  nothing behind it. Shades derived from a see-through text color use how it looks on the page.
- **First visit:** oat `#ede3d6` in light mode, charcoal `#222121` in dark. Saved colors always
  win and don't follow later system changes.
- **Each page color changes only when you change it.** Each one's menu suggests a full
  row of matches for the other color, on both sides of it: the system mode's side first
  (light text and dark pages in dark mode, the reverse in light), then the other, as one
  gradient with no repeats. Text suggestions follow the background's ramp; backgrounds
  keep the text color's hue, about as colorful as it (never neon). Each tile leans in
  richness and hue the way the theme colors do, so the row varies like they do. A
  suggestion or custom color is one undo step.
- **Undo/redo** covers fonts, colors, text styles, the tab title and the background's blur
  and opacity (not the background file): the last 50 steps, surviving a refresh. A pick, a
  stepper press, a typed value, a tab title once the field is left, or a whole color-picker
  drag is one step.
- Each stored setting loads on its own, so one stale value doesn't reset the others, and
  settings added later fall back to defaults. Old forms (one stored font, paragraph spacing
  sizes, a background fade) load as their current equivalents.
- Stored values are names (e.g. `relaxed`), not labels, so labels can change freely.

## Color menus

Every color (text, glow, Foreground, Background) is chosen from the same menu, so it looks
and works the same on every platform:

- **Suggested colors** for that use, then the **custom slots**, then the **picker**, always
  shown: a color square, hue and opacity sliders (all keyboard-operable), the color as text
  to read or type (hex, rgb(), hsl(), names) and a **dropper**.
- Choosing a tile keeps the menu open, so a choice can be fine-tuned in the picker.
- An empty custom slot saves the current color; a filled one is chosen, and its × (shown on
  hover or focus) empties it.
- A typed color applies on Enter or on leaving the field; text that isn't a color goes back
  to the current color.
- A copy button inside the field's end copies the current color's hex.
- The **dropper** picks from anywhere on the screen where the browser can (Chromium).
  Other browsers can't start one, so a palette button opens the system color picker
  instead (its own dropper is a click away on macOS and iOS). Either keeps the current
  transparency.
- **Background** has no opacity slider; a see-through custom color is used opaque there.

## Cozy palette

Derived from the background, never harsh:

- **Default text color:** a gentle step along the page's own tonal ramp.
- **Theme colors** (seven): the page text color first, so the default is one click away,
  then six rich, low-contrast tones around the page, light to dark. Hues lean only a little,
  never toward an unrelated color. Tuned from hand-picked shades on a burgundy page (a test
  keeps them).
- **Neutral pages** (black, white, greys) have no hue to build on: a warm beige accent, then
  greys between page and text. Near-black pages skip the accent (it reads muddy).
- Chroma is capped (no neon), colorful pages get no near-black or near-white tones, and
  pale pages get a chroma floor so tones don't grey out.
- **Muted text** (captions, field placeholders) is soft by default; with "increase
  contrast" on, it becomes the softest mix that reads at 4.5:1.

## Background picture or video

- Chosen on the Background row: any image (GIFs included) or video under a size limit
  (so it doesn't strain browser storage); other files get a toast and the current
  background stays. Once set, the tile shows a still of it, and an × (hover or focus)
  removes it.
- While set, you can blur it and set its opacity over the page color (half by default,
  so writing stays readable). A video can also be paused and sped up or slowed down.
  These share the settings undo and travel in settings files.
- The file is saved before it's shown, so what's shown is what comes back after a refresh.
  Settings files don't carry it.
- It covers the whole window: the sidebar and header turn transparent, while the settings
  drawer, menus, dialogs and the narrow-screen sidebar stay solid so they're readable.
  Videos loop silently. On a first visit a video starts paused if the system asks for
  less motion; after that the saved choice wins. GIFs can't be paused. Hidden from
  screen readers.

## Decisions

- No contrast warnings: people can see whether their colors read. Theme packs are
  starting points, not modes: everything they set stays editable.
- Page colors live apart from the toolbar's text color so the two aren't confused.
- An in-app picker instead of the system one: the system picker can't be themed, differs
  per platform and has no opacity.
- The blur keeps solid edges: CSS `blur()` fades edges to transparent, and WebKit clipped
  media to the window before blurring, showing the page color at the edges.
- Videos blur through a layer over them: WebKit doesn't apply the picture's blur to
  playing video.
