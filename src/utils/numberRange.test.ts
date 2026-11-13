import { parseTypedNumber, snapToRange } from './numberRange'

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
