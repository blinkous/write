import { formatHex, formatHex8, parse } from 'culori'

/** Fully opaque: alpha at (or rounding to) 100 %. */
const OPAQUE_ALPHA = 1

/**
 * A color typed by hand, in any CSS form (hex, rgb(), hsl(), oklch(), a
 * name), as #rrggbb, or #rrggbbaa when it's see-through and that's allowed;
 * null if it isn't a color. A leading # is optional for hex.
 */
export function parseTypedColor(
  text: string,
  allowsTransparency: boolean,
): string | null {
  const trimmed = text.trim()
  const color = parse(trimmed) ?? parse(`#${trimmed}`)
  if (!color) return null
  const isSeeThrough = (color.alpha ?? OPAQUE_ALPHA) < OPAQUE_ALPHA
  return allowsTransparency && isSeeThrough
    ? formatHex8(color)
    : formatHex(color)
}
