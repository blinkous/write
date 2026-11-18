import { parseTypedColor } from './typedColor'

describe('parseTypedColor', () => {
  it('reads hex, with or without #, and CSS color forms', () => {
    expect(parseTypedColor('#A1B2C3', true)).toBe('#a1b2c3')
    expect(parseTypedColor(' a1b2c3 ', true)).toBe('#a1b2c3')
    expect(parseTypedColor('rgb(255 0 0)', true)).toBe('#ff0000')
    expect(parseTypedColor('hsl(120, 100%, 50%)', true)).toBe('#00ff00')
    expect(parseTypedColor('rebeccapurple', true)).toBe('#663399')
  })

  it('keeps transparency only where it is allowed', () => {
    expect(parseTypedColor('rgb(255 0 0 / 50%)', true)).toBe('#ff000080')
    expect(parseTypedColor('#ff000080', false)).toBe('#ff0000')
    expect(parseTypedColor('#ff0000ff', true)).toBe('#ff0000')
  })

  it('rejects text that is not a color', () => {
    expect(parseTypedColor('nope', true)).toBeNull()
    expect(parseTypedColor('', true)).toBeNull()
  })
})
