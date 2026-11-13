import {
  parseTypedNumber,
  snapToRange,
  snapTypedToRange,
  stepThroughRange,
} from './numberRange'

describe('snapToRange', () => {
  const halves = { min: 0, max: 40, step: 0.5 }

  it('rounds to the nearest step without float noise', () => {
    expect(snapToRange(1.2, halves)).toBe(1)
    expect(snapToRange(1.3, halves)).toBe(1.5)
    expect(snapToRange(0.1 + 0.2, { min: 0, max: 1, step: 0.1 })).toBe(0.3)
  })

  it('keeps values within the range', () => {
    expect(snapToRange(-3, halves)).toBe(0)
    expect(snapToRange(99, halves)).toBe(40)
  })

  it('counts steps from the min', () => {
    expect(snapToRange(14, { min: 10, max: 48, step: 4 })).toBe(14)
    expect(snapToRange(15, { min: 10, max: 48, step: 4 })).toBe(14)
  })
})

describe('snapTypedToRange', () => {
  it('keeps typed values down to the precision, between steps', () => {
    const blur = { min: 0, max: 40, step: 0.5, precision: 0.1 }
    expect(snapTypedToRange(0.2, blur)).toBe(0.2)
    expect(snapTypedToRange(0.24, blur)).toBe(0.2)
    expect(snapTypedToRange(41, blur)).toBe(40)
  })

  it('snaps to the step when there is no precision', () => {
    expect(snapTypedToRange(1.2, { min: 0, max: 40, step: 0.5 })).toBe(1)
  })
})

describe('stepThroughRange', () => {
  const tens = { min: 0, max: 100, step: 10 }

  it('moves one step from a value on a step', () => {
    expect(stepThroughRange(50, 1, tens)).toBe(60)
    expect(stepThroughRange(50, -1, tens)).toBe(40)
    expect(stepThroughRange(0.3, 1, { min: 0, max: 1, step: 0.1 })).toBe(0.4)
  })

  it('moves from between steps to the next step in that direction', () => {
    expect(stepThroughRange(55, 1, tens)).toBe(60)
    expect(stepThroughRange(55, -1, tens)).toBe(50)
    expect(stepThroughRange(0.2, 1, { min: 0, max: 40, step: 0.5 })).toBe(0.5)
    expect(stepThroughRange(0.2, -1, { min: 0, max: 40, step: 0.5 })).toBe(0)
  })

  it('stops at the limits', () => {
    expect(stepThroughRange(100, 1, tens)).toBe(100)
    expect(stepThroughRange(0, -1, tens)).toBe(0)
  })
})

describe('parseTypedNumber', () => {
  it.each([
    ['12', 12],
    [' 2.5 ', 2.5],
    ['2,5', 2.5],
    ['-3', -3],
  ])('reads %j as %d', (text, expected) => {
    expect(parseTypedNumber(text)).toBe(expected)
  })

  it.each(['', 'abc', '1.2.3'])('turns down %j', (text) => {
    expect(parseTypedNumber(text)).toBeNull()
  })
})
