import { blend, formatHex } from 'culori'

/**
 * How a color with transparency looks over a solid background, as an opaque
 * #rrggbb: what to derive shades and contrast from (e.g. a see-through page
 * text color). Opaque colors come back as they are.
 */
export function flattenColor(colorHex: string, backgroundHex: string): string {
  return formatHex(blend([backgroundHex, colorHex])) ?? colorHex
}
