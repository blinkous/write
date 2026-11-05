/*
 * Open-licensed Google Fonts (SIL OFL / Apache), bundled locally through
 * Fontsource so no network request is ever made to load them. To add one:
 * `npm i @fontsource-variable/<name>` (or `@fontsource/<name>` if there's no
 * variable version, importing the weights you need), import it below, and add
 * an entry to FONT_OPTIONS. `family` must match the package's font-family name.
 */

import { createOptionGuard } from '../../utils/options'

// Serif
import '@fontsource-variable/eb-garamond'
import '@fontsource-variable/literata'
import '@fontsource-variable/lora'
// Sans
import '@fontsource-variable/inter'
import '@fontsource-variable/nunito'
import '@fontsource-variable/quicksand'
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
import '@fontsource/unifrakturmaguntia'
// Handwriting
import '@fontsource/comforter'
import '@fontsource/permanent-marker'
import '@fontsource/windsong'

export const FONT_OPTIONS = [
  { value: 'lora', label: 'Lora', family: "'Lora Variable', Georgia, serif" },
  {
    value: 'literata',
    label: 'Literata',
    family: "'Literata Variable', Georgia, serif",
  },
  {
    value: 'eb-garamond',
    label: 'EB Garamond',
    family: "'EB Garamond Variable', Garamond, serif",
  },
  {
    value: 'inter',
    label: 'Inter',
    family: "'Inter Variable', system-ui, sans-serif",
  },
  {
    value: 'nunito',
    label: 'Nunito',
    family: "'Nunito Variable', system-ui, sans-serif",
  },
  {
    value: 'quicksand',
    label: 'Quicksand',
    family: "'Quicksand Variable', system-ui, sans-serif",
  },
  {
    value: 'dongle',
    label: 'Dongle',
    family: "'Dongle', system-ui, sans-serif",
  },
  {
    value: 'jetbrains-mono',
    label: 'JetBrains Mono',
    family: "'JetBrains Mono Variable', ui-monospace, monospace",
  },
  {
    value: 'roboto-mono',
    label: 'Roboto Mono',
    family: "'Roboto Mono Variable', ui-monospace, monospace",
  },
  {
    value: 'space-mono',
    label: 'Space Mono',
    family: "'Space Mono', ui-monospace, monospace",
  },
  {
    value: 'major-mono-display',
    label: 'Major Mono Display',
    family: "'Major Mono Display', ui-monospace, monospace",
  },
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
    value: 'unifrakturmaguntia',
    label: 'UnifrakturMaguntia',
    family: "'UnifrakturMaguntia', serif",
  },
  {
    value: 'permanent-marker',
    label: 'Permanent Marker',
    family: "'Permanent Marker', cursive",
  },
  { value: 'comforter', label: 'Comforter', family: "'Comforter', cursive" },
  { value: 'windsong', label: 'WindSong', family: "'WindSong', cursive" },
] as const

export type FontValue = (typeof FONT_OPTIONS)[number]['value']

export const isFontValue = createOptionGuard(FONT_OPTIONS)
