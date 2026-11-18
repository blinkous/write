import {
  areTextStylesEqual,
  DEFAULT_TEXT_STYLES,
  TEXT_STYLE_NAMES,
  type TextStyleName,
  type TextStyles,
  type TextStyleSettings,
} from '../../text-styles'
import { DEFAULT_APPEARANCE, DEFAULT_PAGE_COLORS } from './appearanceOptions'
import type { PageTheme } from './pageThemeHistory'

/** Everything a theme pack sets: the page colors, both fonts and every text style. */
export type ThemeLook = Pick<
  PageTheme,
  'appFont' | 'editorFont' | 'backgroundColor' | 'textColor' | 'textStyles'
>

export type ThemePack = {
  /** Stable name, e.g. for tests; never shown. */
  id: string
  /** Shown only as the tile's tooltip and accessible name. */
  label: string
  look: ThemeLook
}

const HEADING_NAMES = [
  'heading-2',
  'heading-3',
  'heading-4',
  'heading-5',
  'heading-6',
] as const satisfies readonly TextStyleName[]

type TextStyleChanges = Partial<
  Record<TextStyleName, Partial<TextStyleSettings>>
>

/** The default text styles with some settings changed. */
function textStylesWith(changes: TextStyleChanges): TextStyles {
  const textStyles = { ...DEFAULT_TEXT_STYLES }
  for (const name of TEXT_STYLE_NAMES)
    textStyles[name] = { ...textStyles[name], ...changes[name] }
  return textStyles
}

/** The same changes for every heading (Heading 2 to 6). */
function allHeadings(changes: Partial<TextStyleSettings>): TextStyleChanges {
  const headingChanges: TextStyleChanges = {}
  for (const name of HEADING_NAMES) headingChanges[name] = changes
  return headingChanges
}

const DEFAULT_FONTS = {
  appFont: DEFAULT_APPEARANCE.appFont,
  editorFont: DEFAULT_APPEARANCE.editorFont,
}

/**
 * Curated looks, shown as a row of tiles. Colors are fixed hex values (not
 * theme color names), so each tile previews exactly what it applies. The page
 * text color always reads at 4.5:1 (tested); styles may be softer for the look.
 */
export const THEME_PACKS: readonly ThemePack[] = [
  {
    id: 'default-light',
    label: 'Default light',
    look: {
      ...DEFAULT_FONTS,
      ...DEFAULT_PAGE_COLORS.light,
      textStyles: DEFAULT_TEXT_STYLES,
    },
  },
  {
    id: 'default-dark',
    label: 'Default dark',
    look: {
      ...DEFAULT_FONTS,
      ...DEFAULT_PAGE_COLORS.dark,
      textStyles: DEFAULT_TEXT_STYLES,
    },
  },
  {
    // White-hot neon tubes glowing red on a moody, grungy teal sign board.
    id: 'blinkous',
    label: 'Blinkous',
    look: {
      appFont: 'space-mono',
      editorFont: 'jetbrains-mono',
      backgroundColor: '#08282c',
      textColor: '#a3c9c3',
      textStyles: textStylesWith({
        title: {
          font: 'tilt-neon',
          bold: false,
          textCase: 'upper',
          letterSpacing: 8,
          color: '#ffffff',
          glow: '#ff2a1f',
        },
        // Tilt Neon has one weight; bold would be faked.
        ...allHeadings({
          font: 'tilt-neon',
          bold: false,
          textCase: 'upper',
          letterSpacing: 8,
          color: '#ffffff',
          glow: '#ff2a1fcc',
        }),
        small: { color: '#86b1aa' },
      }),
    },
  },
  {
    // Soft pastel rainbow: a bubbly title and headings in pink, yellow, green, blue and purple.
    id: 'unicorn',
    label: 'Unicorn',
    look: {
      appFont: 'quicksand',
      editorFont: 'nunito',
      backgroundColor: '#f8f1fc',
      textColor: '#6b5a85',
      textStyles: textStylesWith({
        title: { font: 'cherry-bomb-one', bold: false, color: '#f49ac1' },
        'heading-2': { font: 'fredoka', color: '#b9a2f0' },
        'heading-3': { font: 'fredoka', color: '#8ec5f0' },
        'heading-4': { font: 'fredoka', color: '#8fd6a8' },
        'heading-5': { font: 'fredoka', color: '#f0cf5e' },
        'heading-6': { font: 'fredoka', color: '#f49ac1' },
      }),
    },
  },
  {
    // Sunlit leaves on a bright, rich green floor, under a mossy, shaggy title.
    id: 'forest',
    label: 'Forest',
    look: {
      appFont: 'nunito',
      editorFont: 'literata',
      backgroundColor: '#175900',
      textColor: '#e2f7d4',
      textStyles: textStylesWith({
        // Rubik Beastly has one weight; bold would be faked.
        title: {
          font: 'rubik-beastly',
          bold: false,
          color: '#d4ff6b',
          glow: '#a8f03a40',
        },
        ...allHeadings({ font: 'eb-garamond', color: '#9ff0a8' }),
      }),
    },
  },
  {
    id: 'high-contrast-light',
    label: 'High contrast light',
    look: {
      appFont: 'inter',
      editorFont: 'inter',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      textStyles: DEFAULT_TEXT_STYLES,
    },
  },
  {
    id: 'high-contrast-dark',
    label: 'High contrast dark',
    look: {
      appFont: 'inter',
      editorFont: 'inter',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      textStyles: DEFAULT_TEXT_STYLES,
    },
  },
]

/** Whether the current settings are exactly this pack's look (it shows as chosen). */
export function hasThemeLook(current: ThemeLook, { look }: ThemePack): boolean {
  return (
    current.appFont === look.appFont &&
    current.editorFont === look.editorFont &&
    current.backgroundColor === look.backgroundColor &&
    current.textColor === look.textColor &&
    areTextStylesEqual(current.textStyles, look.textStyles)
  )
}

/** How many of a pack's colors its tile shows. */
const TILE_COLOR_COUNT = 5

/**
 * The colors a pack's tile shows beside its title preview: the text color,
 * then its styles' glows (the most telling, e.g. neon), then their colors,
 * without repeats.
 */
export function getThemePackColors({ look }: ThemePack): string[] {
  const styles = Object.values(look.textStyles)
  const colors = [
    look.textColor,
    ...styles.map(({ glow }) => glow),
    ...styles.map(({ color }) => color),
  ].filter((color) => color !== null)
  return [...new Set(colors)].slice(0, TILE_COLOR_COUNT)
}
