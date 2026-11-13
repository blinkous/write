export type NumberRange = { min: number; max: number; step: number }

/** Decimal places in a step (0.5 → 1), so stepping never leaves float noise like 0.30000000000000004. */
function getStepDecimals(step: number): number {
  const [, decimals = ''] = String(step).split('.')
  return decimals.length
}

/** The nearest value on the range's steps (counted from its min), kept within it. */
export function snapToRange(
  value: number,
  { min, max, step }: NumberRange,
): number {
  const stepsFromMin = Math.round((value - min) / step)
  const snapped = Number(
    (min + stepsFromMin * step).toFixed(getStepDecimals(step)),
  )
  return Math.min(max, Math.max(min, snapped))
}

/** Reads a typed number, accepting a comma as the decimal mark; null if it isn't one. */
export function parseTypedNumber(text: string): number | null {
  const normalized = text.trim().replace(',', '.')
  if (normalized === '') return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}
