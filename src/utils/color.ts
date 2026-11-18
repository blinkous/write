/* #rrggbb, or #rrggbbaa with transparency. */
const HEX_COLOR_PATTERN = /^#([0-9a-f]{6}|[0-9a-f]{8})$/i
const OPAQUE_HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i

/** A stored color: #rrggbb, or #rrggbbaa where transparency is allowed. */
export function isHexColor(value: string): boolean {
  return HEX_COLOR_PATTERN.test(value)
}

/** A color with no transparency (#rrggbb), e.g. the page background, which has nothing behind it. */
export function isOpaqueHexColor(value: string): boolean {
  return OPAQUE_HEX_COLOR_PATTERN.test(value)
}
