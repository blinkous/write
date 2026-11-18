import { formatHex, interpolate, wcagContrast } from 'culori'
import { flattenColor } from './flattenColor'

/** WCAG AA for normal text. */
const MIN_TEXT_CONTRAST = 4.5

/*
 * How much text color is mixed into the background for the surfaces muted
 * text sits on: the page, --color-surface and --color-surface-strong. Must
 * match those tokens in tokens.css.
 */
const SURFACE_TEXT_SHARES = [0, 0.05, 0.1]

/* Softest first; the text color itself is the last resort. */
const MUTED_TEXT_SHARES = [0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1]

function mixTowardText(
  backgroundHex: string,
  textHex: string,
  textShare: number,
): string {
  return formatHex(interpolate([backgroundHex, textHex], 'rgb')(textShare))
}

/**
 * The softest muted text color (between the background and the text color)
 * that stays readable, at 4.5:1, on every surface it's used on. Low-contrast
 * cozy palettes get a muted color close to the text; high-contrast ones a
 * softer one. If even the text color falls short, it's used as is.
 */
export function deriveReadableMutedColor(
  backgroundHex: string,
  pageTextHex: string,
): string {
  // Contrast is judged on how a see-through text color looks on the page.
  const textHex = flattenColor(pageTextHex, backgroundHex)
  const surfaces = SURFACE_TEXT_SHARES.map((share) =>
    mixTowardText(backgroundHex, textHex, share),
  )
  const share =
    MUTED_TEXT_SHARES.find((candidateShare) => {
      const muted = mixTowardText(backgroundHex, textHex, candidateShare)
      return surfaces.every(
        (surface) => wcagContrast(muted, surface) >= MIN_TEXT_CONTRAST,
      )
    }) ?? 1
  return mixTowardText(backgroundHex, textHex, share)
}
