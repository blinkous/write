import { formatHex, parse } from 'culori'

/* The EyeDropper API (Chromium browsers); not in TypeScript's DOM types yet. */
type EyeDropperResult = { sRGBHex: string }
type EyeDropperInstance = { open: () => Promise<EyeDropperResult> }
declare global {
  interface Window {
    EyeDropper?: new () => EyeDropperInstance
  }
}

/** Whether this browser can pick a color from anywhere on the screen. */
export function canPickScreenColor(): boolean {
  return typeof window.EyeDropper === 'function'
}

/**
 * Lets the person pick a color from anywhere on the screen, as #rrggbb, or
 * null if they cancelled (Escape) or the browser can't.
 */
export async function pickScreenColor(): Promise<string | null> {
  const { EyeDropper } = window
  if (!EyeDropper) return null
  try {
    const { sRGBHex } = await new EyeDropper().open()
    // Some versions report rgb(…) instead of hex.
    return formatHex(parse(sRGBHex)) ?? null
  } catch {
    // Cancelled with Escape (an AbortError).
    return null
  }
}
