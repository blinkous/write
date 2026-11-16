import { isFramed } from './framing'

describe('isFramed', () => {
  it('is false for a page in its own tab', () => {
    expect(isFramed()).toBe(false)
  })

  it("is true when this window isn't the top one", () => {
    expect(isFramed({ self: window, top: null })).toBe(true)
  })
})
