import { createOptionGuard } from './options'

describe('createOptionGuard', () => {
  it('accepts only listed values', () => {
    const isSize = createOptionGuard([
      { value: 'small' },
      { value: 'large' },
    ] as const)
    expect(isSize('small')).toBe(true)
    expect(isSize('huge')).toBe(false)
    expect(isSize(undefined)).toBe(false)
  })
})
