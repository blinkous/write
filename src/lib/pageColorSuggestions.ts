import { oklch } from 'culori'
import {
  deriveBackgroundShadeAt,
  deriveTextShadeAt,
  GENTLEST_LIGHTNESS_GAP,
  PAGE_LIGHTNESS_RANGE,
  TEXT_LIGHTNESS_RANGE,
  TONE_VARIATIONS,
  type ToneVariation,
} from './cozyPalette'

/** Lighter or darker than the color suggestions are for. */
export type LightnessSide = 'lighter' | 'darker'

/** Closest two suggestions on one side may be in lightness, so each looks distinct. */
const MIN_SUGGESTION_STEP = 0.04

type LightnessRange = { readonly min: number; readonly max: number }

/**
 * Where suggestions on one side may go: from the gentlest readable gap (or
 * the range's own limit, if that's farther) out to the range's end; null if
 * nothing readable fits.
 */
function getSideSpan(
  from: number,
  side: LightnessSide,
  range: LightnessRange,
): { nearest: number; farthest: number } | null {
  const span =
    side === 'lighter'
      ? {
          nearest: Math.max(from + GENTLEST_LIGHTNESS_GAP, range.min),
          farthest: range.max,
        }
      : {
          nearest: Math.min(from - GENTLEST_LIGHTNESS_GAP, range.max),
          farthest: range.min,
        }
  const isReachable =
    side === 'lighter'
      ? span.nearest <= span.farthest
      : span.nearest >= span.farthest
  return isReachable ? span : null
}

/** How many distinct lightnesses fit on one side. */
function countFits(from: number, side: LightnessSide, range: LightnessRange) {
  const span = getSideSpan(from, side, range)
  if (!span) return 0
  const room = Math.abs(span.farthest - span.nearest)
  return Math.floor(room / MIN_SUGGESTION_STEP) + 1
}

/** `count` lightnesses on one side, evenly spread from readable to as far as the range goes. */
function spreadLightnesses(
  from: number,
  side: LightnessSide,
  range: LightnessRange,
  count: number,
): number[] {
  const span = getSideSpan(from, side, range)
  if (!span || count === 0) return []
  const { nearest, farthest } = span
  const step = count === 1 ? 0 : (farthest - nearest) / (count - 1)
  return Array.from({ length: count }, (_, index) => nearest + index * step)
}

const OTHER_SIDE: Record<LightnessSide, LightnessSide> = {
  lighter: 'darker',
  darker: 'lighter',
}

/**
 * `count` lightnesses readable against `from`, on both sides of it: about half
 * on the preferred side, the rest on the other (either side takes over what
 * the other has no room for). Ordered as one gradient starting from the
 * preferred side's far end.
 */
function suggestLightnesses(
  from: number,
  preferredSide: LightnessSide,
  range: LightnessRange,
  count: number,
): number[] {
  const otherSide = OTHER_SIDE[preferredSide]
  const preferredFits = countFits(from, preferredSide, range)
  const otherFits = countFits(from, otherSide, range)
  const preferredCount = Math.min(
    preferredFits,
    Math.max(Math.ceil(count / 2), count - otherFits),
  )
  const otherCount = Math.min(otherFits, count - preferredCount)
  const lightnesses = [
    ...spreadLightnesses(from, preferredSide, range, preferredCount),
    ...spreadLightnesses(from, otherSide, range, otherCount),
  ]
  return lightnesses.toSorted((first, second) =>
    preferredSide === 'lighter' ? second - first : first - second,
  )
}

/** The tile's lean, taken in turn from the theme tones', so the row varies like the theme colors. */
function getToneVariation(index: number): ToneVariation {
  return TONE_VARIATIONS[index % TONE_VARIATIONS.length]
}

/** Drops repeats (shades can round to the same hex), keeping the order. */
function unique(colors: string[]): string[] {
  return [...new Set(colors)]
}

/**
 * Text colors to suggest for a page: up to `count`, readable, on both sides
 * of it, starting with the preferred side (e.g. lighter text in dark mode),
 * each leaning in richness and hue like the theme colors.
 */
export function suggestTextColors(
  backgroundHex: string,
  preferredSide: LightnessSide,
  count: number,
): string[] {
  const from = oklch(backgroundHex)?.l ?? 0
  return unique(
    suggestLightnesses(from, preferredSide, TEXT_LIGHTNESS_RANGE, count).map(
      (lightness, index) =>
        deriveTextShadeAt(backgroundHex, lightness, getToneVariation(index)),
    ),
  )
}

/**
 * Page colors to suggest for a (solid) text color: up to `count`, readable,
 * around its hue, on both sides of it, starting with the preferred side (e.g.
 * darker pages in dark mode), each leaning in richness and hue like the
 * theme colors.
 */
export function suggestBackgroundColors(
  textHex: string,
  preferredSide: LightnessSide,
  count: number,
): string[] {
  const from = oklch(textHex)?.l ?? 0
  return unique(
    suggestLightnesses(from, preferredSide, PAGE_LIGHTNESS_RANGE, count).map(
      (lightness, index) =>
        deriveBackgroundShadeAt(textHex, lightness, getToneVariation(index)),
    ),
  )
}
