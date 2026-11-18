import { oklch } from 'culori'

/** How light a color looks, 0 (black) to 1 (white): OKLCH lightness, which tracks the eye. */
export function getPerceivedLightness(colorHex: string): number {
  return oklch(colorHex)?.l ?? 0
}
