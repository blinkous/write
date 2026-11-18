import { isHexColor, isOpaqueHexColor } from './color'

describe('isHexColor', () => {
  it('accepts six-digit hex colors, with or without transparency', () => {
    expect(isHexColor('#A1b2C3')).toBe(true)
    expect(isHexColor('#a1b2c380')).toBe(true)
    expect(isHexColor('#abc')).toBe(false)
    expect(isHexColor('#a1b2c38')).toBe(false)
    expect(isHexColor('red')).toBe(false)
  })
})

describe('isOpaqueHexColor', () => {
  it('accepts six-digit hex colors only', () => {
    expect(isOpaqueHexColor('#A1b2C3')).toBe(true)
    expect(isOpaqueHexColor('#a1b2c380')).toBe(false)
  })
})
