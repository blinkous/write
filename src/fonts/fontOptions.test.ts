import { FALLBACK_FONT, FONT_OPTIONS, getFontOption } from './fontOptions'

describe('FONT_OPTIONS', () => {
  it('lists fonts alphabetically by name', () => {
    const labels = FONT_OPTIONS.map(({ label }) => label)
    expect(labels).toEqual(
      [...labels].sort((first, second) =>
        first.localeCompare(second, 'en', { sensitivity: 'base' }),
      ),
    )
  })

  it('includes the fallback font', () => {
    expect(getFontOption(FALLBACK_FONT.value)).toBe(FALLBACK_FONT)
  })
})
