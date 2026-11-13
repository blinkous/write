import { pxToRem } from './units'

describe('pxToRem', () => {
  it('writes px at normal zoom as rem', () => {
    expect(pxToRem(16)).toBe('1rem')
    expect(pxToRem(28)).toBe('1.75rem')
    expect(pxToRem(0)).toBe('0rem')
  })
})
