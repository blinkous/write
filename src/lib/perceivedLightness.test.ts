import { getPerceivedLightness } from './perceivedLightness'

describe('getPerceivedLightness', () => {
  it('runs from black to white', () => {
    expect(getPerceivedLightness('#000000')).toBeCloseTo(0)
    expect(getPerceivedLightness('#ffffff')).toBeCloseTo(1)
  })

  it('rates yellow lighter than blue of the same sRGB strength', () => {
    expect(getPerceivedLightness('#ffff00')).toBeGreaterThan(
      getPerceivedLightness('#0000ff'),
    )
  })
})
