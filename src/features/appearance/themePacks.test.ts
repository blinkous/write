import { wcagContrast } from 'culori'
import { flattenColor } from '../../lib/flattenColor'
import { DEFAULT_TEXT_STYLES, textStylesSchema } from '../../text-styles'
import { DEFAULT_APPEARANCE, DEFAULT_PAGE_COLORS } from './appearanceOptions'
import { getThemePackColors, hasThemeLook, THEME_PACKS } from './themePacks'

const MIN_TEXT_CONTRAST = 4.5

describe('THEME_PACKS', () => {
  it.each(THEME_PACKS)(
    '$label: the writing (page text, Body and Small) reads on its page',
    ({ look }) => {
      const { backgroundColor, textColor, textStyles } = look
      const { body, small } = textStyles
      // Titles and headings may be softer for the look (e.g. pastels).
      const textColors = [
        textColor,
        body.color ?? textColor,
        small.color ?? textColor,
      ]
      for (const color of textColors)
        expect(
          wcagContrast(flattenColor(color, backgroundColor), backgroundColor),
        ).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST)
    },
  )

  it.each(THEME_PACKS)(
    '$label: text styles survive storage unchanged',
    ({ look }) => {
      expect(textStylesSchema.parse(look.textStyles)).toEqual(look.textStyles)
    },
  )

  it('includes the first-visit looks for light and dark mode', () => {
    for (const colors of Object.values(DEFAULT_PAGE_COLORS))
      expect(
        THEME_PACKS.some((pack) =>
          hasThemeLook(
            {
              appFont: DEFAULT_APPEARANCE.appFont,
              editorFont: DEFAULT_APPEARANCE.editorFont,
              textStyles: DEFAULT_TEXT_STYLES,
              ...colors,
            },
            pack,
          ),
        ),
      ).toBe(true)
  })

  it('has unique ids and labels', () => {
    expect(new Set(THEME_PACKS.map(({ id }) => id)).size).toBe(
      THEME_PACKS.length,
    )
    expect(new Set(THEME_PACKS.map(({ label }) => label)).size).toBe(
      THEME_PACKS.length,
    )
  })
})

describe('hasThemeLook', () => {
  const [pack] = THEME_PACKS

  it('matches only when every part of the look is the same', () => {
    expect(hasThemeLook(pack.look, pack)).toBe(true)
    expect(hasThemeLook({ ...pack.look, textColor: '#010203' }, pack)).toBe(
      false,
    )
    expect(
      hasThemeLook(
        {
          ...pack.look,
          textStyles: {
            ...pack.look.textStyles,
            body: { ...pack.look.textStyles.body, size: 20 },
          },
        },
        pack,
      ),
    ).toBe(false)
  })
})

describe('getThemePackColors', () => {
  it('starts with the text color, then glows, without repeats', () => {
    const blinkous = THEME_PACKS.find(({ id }) => id === 'blinkous')
    expect(blinkous).toBeDefined()
    if (!blinkous) return
    const colors = getThemePackColors(blinkous)
    expect(colors[0]).toBe(blinkous.look.textColor)
    expect(colors[1]).toBe(blinkous.look.textStyles.title.glow)
    expect(new Set(colors).size).toBe(colors.length)
  })
})
