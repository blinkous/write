import { flattenColor } from './flattenColor'

describe('flattenColor', () => {
  it('mixes a see-through color into the background', () => {
    expect(flattenColor('#00000080', '#ffffff')).toBe('#7f7f7f')
  })

  it('keeps opaque colors as they are', () => {
    expect(flattenColor('#123456', '#ffffff')).toBe('#123456')
  })
})
