/*
 * Open-licensed Google Fonts (SIL OFL / Apache), bundled locally through
 * Fontsource so no network request is ever made to load them. To add one:
 * `npm i @fontsource-variable/<name>` (or `@fontsource/<name>` if there's no
 * variable version, importing the weights you need), import it below, and add
 * an entry to FONT_OPTIONS in alphabetical order. `family` must match the package's font-family name.
 */

import { createOptionGuard } from '../utils/options'

// Serif
import '@fontsource-variable/eb-garamond'
import '@fontsource-variable/literata'
import '@fontsource-variable/lora'
// Sans
import '@fontsource-variable/inter'
import '@fontsource-variable/nunito'
import '@fontsource-variable/quicksand'
import '@fontsource-variable/fredoka'
import '@fontsource/dongle/400.css'
import '@fontsource/dongle/700.css'
// Mono
import '@fontsource-variable/jetbrains-mono'
import '@fontsource-variable/roboto-mono'
import '@fontsource/major-mono-display'
import '@fontsource/space-mono/400.css'
import '@fontsource/space-mono/700.css'
// Display
import '@fontsource/amatic-sc/400.css'
import '@fontsource/amatic-sc/700.css'
import '@fontsource/bungee-hairline'
import '@fontsource/bungee-outline'
import '@fontsource/bungee-shade'
import '@fontsource-variable/tilt-neon'
import '@fontsource/cherry-bomb-one'
import '@fontsource/henny-penny'
import '@fontsource/eater'
import '@fontsource/rubik-beastly'
import '@fontsource/rubik-glitch'
import '@fontsource/rubik-puddles'
import '@fontsource/unifrakturmaguntia'
// Handwriting
import '@fontsource/comforter'
import '@fontsource/permanent-marker'
import '@fontsource/windsong'

/** Used where a font can't be found; also the writing's default (see appearance). */
export const FALLBACK_FONT = {
  value: 'lora',
  label: 'Lora',
  family: "'Lora Variable', Georgia, serif",
} as const

/** Alphabetical by name, as the font menus list them (tested). */
export const FONT_OPTIONS = [
  { value: 'amatic-sc', label: 'Amatic SC', family: "'Amatic SC', cursive" },
  {
    value: 'bungee-hairline',
    label: 'Bungee Hairline',
    family: "'Bungee Hairline', system-ui, sans-serif",
  },
  {
    value: 'bungee-outline',
    label: 'Bungee Outline',
    family: "'Bungee Outline', system-ui, sans-serif",
  },
  {
    value: 'bungee-shade',
    label: 'Bungee Shade',
    family: "'Bungee Shade', system-ui, sans-serif",
  },
  {
    value: 'cherry-bomb-one',
    label: 'Cherry Bomb One',
    family: "'Cherry Bomb One', system-ui, sans-serif",
  },
  { value: 'comforter', label: 'Comforter', family: "'Comforter', cursive" },
  {
    value: 'dongle',
    label: 'Dongle',
    family: "'Dongle', system-ui, sans-serif",
  },
  {
    value: 'eater',
    label: 'Eater',
    family: "'Eater', system-ui, sans-serif",
  },
  {
    value: 'eb-garamond',
    label: 'EB Garamond',
    family: "'EB Garamond Variable', Garamond, serif",
  },
  {
    value: 'fredoka',
    label: 'Fredoka',
    family: "'Fredoka Variable', system-ui, sans-serif",
  },
  {
    value: 'henny-penny',
    label: 'Henny Penny',
    family: "'Henny Penny', cursive",
  },
  {
    value: 'inter',
    label: 'Inter',
    family: "'Inter Variable', system-ui, sans-serif",
  },
  {
    value: 'jetbrains-mono',
    label: 'JetBrains Mono',
    family: "'JetBrains Mono Variable', ui-monospace, monospace",
  },
  {
    value: 'literata',
    label: 'Literata',
    family: "'Literata Variable', Georgia, serif",
  },
  FALLBACK_FONT,
  {
    value: 'major-mono-display',
    label: 'Major Mono Display',
    family: "'Major Mono Display', ui-monospace, monospace",
  },
  {
    value: 'nunito',
    label: 'Nunito',
    family: "'Nunito Variable', system-ui, sans-serif",
  },
  {
    value: 'permanent-marker',
    label: 'Permanent Marker',
    family: "'Permanent Marker', cursive",
  },
  {
    value: 'quicksand',
    label: 'Quicksand',
    family: "'Quicksand Variable', system-ui, sans-serif",
  },
  {
    value: 'roboto-mono',
    label: 'Roboto Mono',
    family: "'Roboto Mono Variable', ui-monospace, monospace",
  },
  {
    value: 'rubik-beastly',
    label: 'Rubik Beastly',
    family: "'Rubik Beastly', system-ui, sans-serif",
  },
  {
    value: 'rubik-glitch',
    label: 'Rubik Glitch',
    family: "'Rubik Glitch', system-ui, sans-serif",
  },
  {
    value: 'rubik-puddles',
    label: 'Rubik Puddles',
    family: "'Rubik Puddles', system-ui, sans-serif",
  },
  {
    value: 'space-mono',
    label: 'Space Mono',
    family: "'Space Mono', ui-monospace, monospace",
  },
  {
    value: 'tilt-neon',
    label: 'Tilt Neon',
    family: "'Tilt Neon Variable', system-ui, sans-serif",
  },
  {
    value: 'unifrakturmaguntia',
    label: 'UnifrakturMaguntia',
    family: "'UnifrakturMaguntia', serif",
  },
  { value: 'windsong', label: 'WindSong', family: "'WindSong', cursive" },
] as const

export type FontOption = (typeof FONT_OPTIONS)[number]
export type FontValue = FontOption['value']

export const isFontValue = createOptionGuard(FONT_OPTIONS)

/** The option for a stored font value, falling back to FALLBACK_FONT. */
export function getFontOption(font: FontValue) {
  return FONT_OPTIONS.find(({ value }) => value === font) ?? FALLBACK_FONT
}
