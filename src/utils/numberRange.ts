export type NumberRange = {
  min: number
  max: number
  /** How far each step moves the value. */
  step: number
  /** The finest value that can be typed (e.g. 0.1); the step when not given. */
  precision?: number
}

/** Decimal places in a step (0.5 → 1), so stepping never leaves float noise like 0.30000000000000004. */
function getStepDecimals(step: number): number {
  const [, decimals = ''] = String(step).split('.')
  return decimals.length
}

function clampToRange(value: number, { min, max }: NumberRange): number {
  return Math.min(max, Math.max(min, value))
}

/** The value on the grid `stepsFromMin` steps of `unit` up from the min, without float noise. */
function getGridValue(min: number, unit: number, stepsFromMin: number): number {
  return Number((min + stepsFromMin * unit).toFixed(getStepDecimals(unit)))
}

/** The nearest value on the range's steps (counted from its min), kept within it. */
export function snapToRange(value: number, range: NumberRange): number {
  const { min, step } = range
  const stepsFromMin = Math.round((value - min) / step)
  return clampToRange(getGridValue(min, step, stepsFromMin), range)
}

/** A typed value: kept as typed down to the range's precision, within the range. */
export function snapTypedToRange(value: number, range: NumberRange): number {
  const { step, precision = step } = range
  return snapToRange(value, { ...range, step: precision })
}

/**
 * One step up or down: the next value on the range's steps in that direction,
 * so a typed value in between (e.g. 55 by tens) moves to 60 or 50, not 65 or 45.
 */
export function stepThroughRange(
  value: number,
  direction: 1 | -1,
  range: NumberRange,
): number {
  const { min, step } = range
  const stepsFromMin = (value - min) / step
  // Tolerates float noise, so a value already on a step counts as on it.
  const nearestSteps = Math.round(stepsFromMin)
  const isOnStep = Math.abs(stepsFromMin - nearestSteps) < 1e-9
  const currentSteps = isOnStep
    ? nearestSteps
    : direction === 1
      ? Math.floor(stepsFromMin)
      : Math.ceil(stepsFromMin)
  return clampToRange(getGridValue(min, step, currentSteps + direction), range)
}

/** Reads a typed number, accepting a comma as the decimal mark; null if it isn't one. */
export function parseTypedNumber(text: string): number | null {
  const normalized = text.trim().replace(',', '.')
  if (normalized === '') return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}
