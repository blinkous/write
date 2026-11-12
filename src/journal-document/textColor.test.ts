import { resolveTextColor } from './textColor'

describe('resolveTextColor', () => {
  it('maps theme names to their live design tokens', () => {
    expect(resolveTextColor('theme-3')).toBe('var(--color-theme-3)')
  })

  it('passes hex colors through', () => {
    expect(resolveTextColor('#b03a48')).toBe('#b03a48')
  })

  it('ignores anything else, e.g. from an imported file', () => {
    expect(resolveTextColor('theme-9')).toBeNull()
    expect(resolveTextColor('red; background: url(x)')).toBeNull()
    expect(resolveTextColor(undefined)).toBeNull()
  })
})
