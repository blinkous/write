import { isHexColor } from './color'

describe('isHexColor', () => {
  it('accepts six-digit hex colors only', () => {
    expect(isHexColor('#A1b2C3')).toBe(true)
    expect(isHexColor('#abc')).toBe(false)
    expect(isHexColor('red')).toBe(false)
  })
})
