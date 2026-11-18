import { clampChroma, formatHex, oklch } from 'culori'
import { flattenColor } from './flattenColor'

/*
 * Cozy colors derived from the page background, in OKLCH (where lightness and
 * colorfulness match how they look):
 *  - Default text color: a step along a tonal ramp of the page (same hue,
 *    gently contrasting, chroma peaking in the mid-tones).
 *  - Theme colors: rich, low-contrast tones around the page color, a little
 *    lighter and darker, leaning to neighbouring hues (see THEME_RECIPES).
 *  - Never harsh: no near-black or near-white, and chroma is capped so vivid
 *    pages don't turn neon. Grey pages get a warm tint instead of flat grey.
 */

/** OKLCH lightness above which a page counts as light (shades go darker). */
const LIGHT_PAGE_LIGHTNESS = 0.6

/* Never darker than soft charcoal or lighter than soft cream, so mid-tone pages stay gentle. */
const MIN_LIGHTNESS = 0.26
const MAX_LIGHTNESS = 0.94
/** How light or dark text colors may get. */
export const TEXT_LIGHTNESS_RANGE = {
  min: MIN_LIGHTNESS,
  max: MAX_LIGHTNESS,
} as const

/** Pages less colorful than this are treated as neutral and warmed up. */
const NEUTRAL_CHROMA = 0.012
const WARM_NEUTRAL_HUE = 65

/* Peak colorfulness of the ramp, relative to the page's, within cozy bounds. */
const PEAK_CHROMA_SCALE = 2.2
const MIN_PEAK_CHROMA = 0.03
const MAX_PEAK_CHROMA = 0.12
/** Lightness where colorfulness peaks; it fades with distance from here. */
const PEAK_CHROMA_LIGHTNESS = 0.55
const CHROMA_FALLOFF = 1.3
const MIN_CHROMA_SHARE = 0.25

/* Positions along the text ramp, used to fit mid-tone pages (see fitDistance). */
const TEXT_RAMP_DISTANCES = [0.2, 0.29, 0.38, 0.47, 0.56] as const
/** The gentlest lightness gap between text and page: the ramp's closest step. */
export const [GENTLEST_LIGHTNESS_GAP] = TEXT_RAMP_DISTANCES
const TEXT_LIGHTNESS_DISTANCE = 0.5

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Mid-tone pages have little room before the lightness limits, so the ramp is
 * compressed to fit, keeping the closest step and the steps distinct.
 */
function fitDistance(distance: number, availableRoom: number): number {
  const [closest] = TEXT_RAMP_DISTANCES
  const farthest = TEXT_RAMP_DISTANCES[TEXT_RAMP_DISTANCES.length - 1]
  if (availableRoom >= farthest) return distance
  if (availableRoom <= closest) return availableRoom
  return (
    closest +
    ((distance - closest) / (farthest - closest)) * (availableRoom - closest)
  )
}

/** How much of the ramp's peak chroma a shade at this lightness gets. */
function chromaShareAt(lightness: number): number {
  return Math.max(
    1 - Math.abs(lightness - PEAK_CHROMA_LIGHTNESS) * CHROMA_FALLOFF,
    MIN_CHROMA_SHARE,
  )
}

/** How a suggested shade leans from the plain ramp: richer or softer, and toward a neighbouring hue. */
export type ToneVariation = {
  /** Multiplier on the shade's chroma. */
  chromaScale: number
  /** Degrees around the color wheel from the hue it's derived from. */
  hueShift: number
}

const NO_VARIATION: ToneVariation = { chromaScale: 1, hueShift: 0 }

function shiftHue(hue: number, hueShift: number): number {
  return (hue + hueShift + 360) % 360
}

/**
 * A text color for a page at this lightness: the page's hue (warm if the page
 * is neutral) with chroma along the ramp, peaking in the mid-tones.
 */
export function deriveTextShadeAt(
  backgroundHex: string,
  lightness: number,
  { chromaScale, hueShift }: ToneVariation = NO_VARIATION,
): string {
  const background = oklch(backgroundHex)
  if (!background) return backgroundHex
  const isNeutral = background.c < NEUTRAL_CHROMA
  const hue = isNeutral ? WARM_NEUTRAL_HUE : (background.h ?? WARM_NEUTRAL_HUE)
  const peakChroma = clamp(
    background.c * PEAK_CHROMA_SCALE,
    MIN_PEAK_CHROMA,
    MAX_PEAK_CHROMA,
  )
  const shade = {
    mode: 'oklch' as const,
    l: lightness,
    c: Math.min(
      peakChroma * chromaShareAt(lightness) * chromaScale,
      MAX_THEME_CHROMA,
    ),
    h: shiftHue(hue, hueShift),
  }
  // Pull chroma in (keeping hue and lightness) if the shade can't be shown on screen.
  return formatHex(clampChroma(shade, 'oklch'))
}

function deriveShade(backgroundHex: string, lightnessDistance: number): string {
  const background = oklch(backgroundHex)
  if (!background) return backgroundHex
  const direction = background.l > LIGHT_PAGE_LIGHTNESS ? -1 : 1
  const availableRoom =
    direction < 0 ? background.l - MIN_LIGHTNESS : MAX_LIGHTNESS - background.l
  const lightness = clamp(
    background.l + direction * fitDistance(lightnessDistance, availableRoom),
    MIN_LIGHTNESS,
    MAX_LIGHTNESS,
  )
  return deriveTextShadeAt(backgroundHex, lightness)
}

/** A default text color from the same ramp: matches the page, gently contrasting. */
export function deriveCozyTextColor(backgroundHex: string): string {
  return deriveShade(backgroundHex, TEXT_LIGHTNESS_DISTANCE)
}

/** Pages may sit closer to black or white than text does. */
export const PAGE_LIGHTNESS_RANGE = { min: 0.18, max: 0.97 } as const

/**
 * A page color for a text color at this lightness: the text's hue (warm if
 * it's neutral) and about its colorfulness (undone from where it sits on the
 * ramp), so a rich text color gives rich pages; capped like the ramp, so
 * never neon.
 */
export function deriveBackgroundShadeAt(
  textHex: string,
  lightness: number,
  { chromaScale, hueShift }: ToneVariation = NO_VARIATION,
): string {
  const text = oklch(textHex)
  if (!text) return textHex
  const isNeutral = text.c < NEUTRAL_CHROMA
  const hue = isNeutral ? WARM_NEUTRAL_HUE : (text.h ?? WARM_NEUTRAL_HUE)
  const chroma = clamp(
    (text.c / chromaShareAt(text.l)) * chromaScale,
    0,
    MAX_PEAK_CHROMA,
  )
  const page = {
    mode: 'oklch' as const,
    l: lightness,
    c: chroma,
    h: shiftHue(hue, hueShift),
  }
  return formatHex(clampChroma(page, 'oklch'))
}

/**
 * A page color for a text color: the text color's ramp walked back (see
 * deriveShade), so a text color derived from a page gives about that page
 * back: the text's distance away on the other side.
 */
export function deriveCozyBackgroundColor(textHex: string): string {
  const text = oklch(textHex)
  if (!text) return textHex
  const direction = text.l > LIGHT_PAGE_LIGHTNESS ? -1 : 1
  const lightness = clamp(
    text.l + direction * TEXT_LIGHTNESS_DISTANCE,
    PAGE_LIGHTNESS_RANGE.min,
    PAGE_LIGHTNESS_RANGE.max,
  )
  return deriveBackgroundShadeAt(textHex, lightness)
}

type ThemeRecipe = {
  /** Lightness change toward the text side (lighter on dark pages); negative goes past the page. */
  lightnessOffset: number
  /** Multiplier on the page's chroma (with a floor for pale pages). */
  chromaScale: number
  /** Degrees around the color wheel from the page hue. */
  hueShift: number
}

/*
 * Six rich, low-contrast tones around the page color, tuned from hand-picked
 * shades on a burgundy page: a dusty mauve, an orchid leaning toward purple, a
 * cluster of three close cousins (raspberry, berry, plum) around the page
 * itself, and a wine a touch deeper than the page. Hues only lean a little
 * (toward purple for the orchid), so nothing drifts to an unrelated color.
 */
const THEME_RECIPES: readonly ThemeRecipe[] = [
  { lightnessOffset: 0.26, chromaScale: 0.75, hueShift: -1 },
  { lightnessOffset: 0.25, chromaScale: 1.1, hueShift: -25 },
  { lightnessOffset: 0.13, chromaScale: 1.35, hueShift: 5 },
  { lightnessOffset: 0.08, chromaScale: 1.3, hueShift: -2 },
  { lightnessOffset: 0.03, chromaScale: 1.2, hueShift: -7 },
  { lightnessOffset: -0.06, chromaScale: 0.8, hueShift: 4 },
]

/**
 * The theme tones' leans (richness and hue), in order: suggestions take them
 * in turn, so a row of suggestions varies the way the theme colors do.
 */
export const TONE_VARIATIONS: readonly ToneVariation[] = THEME_RECIPES.map(
  ({ chromaScale, hueShift }) => ({ chromaScale, hueShift }),
)

/** Pale pages carry little color, so their tones start from at least this chroma. */
const MIN_THEME_BASE_CHROMA = 0.075
const NEUTRAL_THEME_BASE_CHROMA = 0.05
const MAX_THEME_CHROMA = 0.16

function deriveThemeColor(
  backgroundHex: string,
  { lightnessOffset, chromaScale, hueShift }: ThemeRecipe,
): string {
  const background = oklch(backgroundHex)
  if (!background) return backgroundHex
  const isNeutral = background.c < NEUTRAL_CHROMA
  const hue = isNeutral ? WARM_NEUTRAL_HUE : (background.h ?? WARM_NEUTRAL_HUE)
  const baseChroma = isNeutral
    ? NEUTRAL_THEME_BASE_CHROMA
    : Math.max(background.c, MIN_THEME_BASE_CHROMA)
  const towardText = background.l > LIGHT_PAGE_LIGHTNESS ? -1 : 1
  const pastPage = background.l + towardText * lightnessOffset
  // No room past the page (e.g. deeper than near-white): step toward the text side instead.
  const lightness =
    pastPage < MIN_LIGHTNESS || pastPage > MAX_LIGHTNESS
      ? background.l + towardText * Math.abs(lightnessOffset)
      : pastPage
  const shade = {
    mode: 'oklch' as const,
    l: clamp(lightness, MIN_LIGHTNESS, MAX_LIGHTNESS),
    c: Math.min(baseChroma * chromaScale, MAX_THEME_CHROMA),
    h: shiftHue(hue, hueShift),
  }
  // Pull chroma in (keeping hue and lightness) if the shade can't be shown on screen.
  return formatHex(clampChroma(shade, 'oklch'))
}

function lightnessOf(hex: string): number {
  return oklch(hex)?.l ?? 0
}

/* Black, white and grey pages: shades of grey instead of hue-shifted tones. */

/** Neutral pages darker than this (near-black) get only greys, no warm accent. */
const NEAR_BLACK_LIGHTNESS = 0.2
/** Where greys sit between the page (0) and the text color (1); spread evenly. */
const GREY_SPAN = { nearestText: 0.9, nearestPage: 0.4 } as const

function deriveGreys(
  backgroundLightness: number,
  textLightness: number,
  count: number,
): string[] {
  const { nearestText, nearestPage } = GREY_SPAN
  return Array.from({ length: count }, (_, index) => {
    const share =
      nearestText -
      (index * (nearestText - nearestPage)) / Math.max(count - 1, 1)
    const lightness =
      backgroundLightness + share * (textLightness - backgroundLightness)
    return formatHex({ mode: 'oklch', l: lightness, c: 0, h: 0 })
  })
}

/**
 * For a neutral page: a warm light accent (except on near-black pages, where
 * it reads muddy), then greys between the page and the text color, light to dark.
 */
function deriveNeutralTones(
  backgroundHex: string,
  pageTextColor: string,
): string[] {
  const backgroundLightness = lightnessOf(backgroundHex)
  const keepsWarmAccent = backgroundLightness >= NEAR_BLACK_LIGHTNESS
  const toneCount = THEME_RECIPES.length
  const greys = deriveGreys(
    backgroundLightness,
    lightnessOf(pageTextColor),
    keepsWarmAccent ? toneCount - 1 : toneCount,
  ).toSorted((first, second) => lightnessOf(second) - lightnessOf(first))
  // The first recipe is the lightest, softest tone: a warm beige on neutral pages.
  return keepsWarmAccent
    ? [deriveThemeColor(backgroundHex, THEME_RECIPES[0]), ...greys]
    : greys
}

function isNeutralColor(hex: string): boolean {
  return (oklch(hex)?.c ?? 0) < NEUTRAL_CHROMA
}

/**
 * The seven theme colors: first the page text color (so the default is always
 * one click away), then six tones around the page color, ordered light to
 * dark. Neutral pages (black, white, greys) get greys instead of hue shifts.
 */
export function deriveCozyThemeColors(
  backgroundHex: string,
  pageTextColor: string,
): string[] {
  if (isNeutralColor(backgroundHex)) {
    // Greys sit between the page and how a see-through text color looks on it.
    const solidTextColor = flattenColor(pageTextColor, backgroundHex)
    return [pageTextColor, ...deriveNeutralTones(backgroundHex, solidTextColor)]
  }
  const tones = THEME_RECIPES.map((recipe) =>
    deriveThemeColor(backgroundHex, recipe),
  ).toSorted((first, second) => lightnessOf(second) - lightnessOf(first))
  return [pageTextColor, ...tones]
}
