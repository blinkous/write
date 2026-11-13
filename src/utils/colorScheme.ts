export type ColorScheme = 'light' | 'dark'

/** The system's light/dark setting right now (light where it can't be read, e.g. tests). */
export function getSystemColorScheme(): ColorScheme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}
