import { getPerceivedLightness } from '../../lib/perceivedLightness'
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

/** A look with its names: the curated packs' and the ones people save. */
export type NamedThemeLook = {
  /** Stable name, e.g. for tests and React keys; never shown. */
  id: string
  /** Shown only as the tile's tooltip and accessible name. */
  label: string
  look: ThemeLook
}

export type ThemePack = NamedThemeLook & {
  /**
   * A look people rely on to read comfortably (the defaults):
   * its writing must read at 4.5:1 (tested). Other packs are vibes, chosen on
   * sight, and may be as soft as their look asks.
   */
  isReadingBaseline: boolean
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
 * Curated looks, shown as a row of tiles (in THEME_PACKS' order, light to
 * dark). Colors are fixed hex values (not theme color names), so each tile
 * previews exactly what it applies.
 */
const CURATED_THEME_PACKS: readonly ThemePack[] = [
  {
    id: 'default-light',
    label: 'Default light',
    isReadingBaseline: true,
    look: {
      ...DEFAULT_FONTS,
      ...DEFAULT_PAGE_COLORS.light,
      textStyles: DEFAULT_TEXT_STYLES,
    },
  },
  {
    id: 'default-dark',
    label: 'Default dark',
    isReadingBaseline: true,
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
    isReadingBaseline: false,
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
    isReadingBaseline: false,
    look: {
      appFont: 'quicksand',
      editorFont: 'nunito',
      backgroundColor: '#f8f1fc',
      textColor: '#6b5a85',
      textStyles: textStylesWith({
        title: { font: 'cherry-bomb-one', bold: false, color: '#ffd0e4' },
        'heading-2': { font: 'fredoka', color: '#b9a2f0' },
        'heading-3': { font: 'fredoka', color: '#8edbf0' },
        'heading-4': { font: 'fredoka', color: '#bdd68f' },
        'heading-5': { font: 'fredoka', color: '#ffd33b' },
        'heading-6': { font: 'fredoka', color: '#f49ac1' },
      }),
    },
  },
  {
    // Named for the cochineal insect, source of carmine, the red dye first
    // made by Indigenous peoples of Mexico and Peru.
    id: 'cochineal',
    label: 'Cochineal',
    isReadingBaseline: false,
    look: {
      ...DEFAULT_FONTS,
      backgroundColor: '#7c0928',
      textColor: '#ca6983',
      textStyles: DEFAULT_TEXT_STYLES,
    },
  },
]

/** Lightest page first, so the row reads as one gradient; a new pack finds its own place. */
export const THEME_PACKS: readonly ThemePack[] = CURATED_THEME_PACKS.toSorted(
  (first, second) =>
    getPerceivedLightness(second.look.backgroundColor) -
    getPerceivedLightness(first.look.backgroundColor),
)

/** Whether the current settings are exactly this pack's look (it shows as chosen). */
export function hasThemeLook(
  current: ThemeLook,
  { look }: Pick<NamedThemeLook, 'look'>,
): boolean {
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
export function getThemePackColors({
  look,
}: Pick<NamedThemeLook, 'look'>): string[] {
  const styles = Object.values(look.textStyles)
  const colors = [
    look.textColor,
    ...styles.map(({ glow }) => glow),
    ...styles.map(({ color }) => color),
  ].filter((color) => color !== null)
  return [...new Set(colors)].slice(0, TILE_COLOR_COUNT)
}
