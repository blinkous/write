/** The browser's default font size; rem values are relative to it. */
const BASE_FONT_SIZE_PX = 16

/** A size in px at normal zoom, written as rem so browser zoom still scales it. */
export function pxToRem(px: number): string {
  return `${px / BASE_FONT_SIZE_PX}rem`
}
