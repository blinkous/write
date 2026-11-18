import { differenceEuclidean, oklch } from 'culori'
import {
  deriveCozyBackgroundColor,
  deriveCozyBackgroundColors,
  deriveCozyTextColor,
  deriveCozyTextColors,
  deriveCozyThemeColors,
} from './cozyPalette'

const COLORFUL_BACKGROUNDS = {
  burgundy: '#6e2340',
  dustyRose: '#f0dfdb',
  oat: '#ede3d6',
  cocoa: '#2b211c',
  navy: '#1c2433',
  sage: '#dfe5d8',
}

const NEUTRAL_BACKGROUNDS = {
  white: '#ffffff',
  lightGrey: '#d0d0d0',
  grey: '#808080',
  nearBlack: '#151515',
  black: '#000000',
}

const ALL_BACKGROUNDS = { ...COLORFUL_BACKGROUNDS, ...NEUTRAL_BACKGROUNDS }

function toOklch(hex: string) {
  const color = oklch(hex)
  if (!color) throw new Error(`Not a color: ${hex}`)
  return color
}

function hueDistance(first: number, second: number): number {
  const distance = Math.abs(first - second) % 360
  return Math.min(distance, 360 - distance)
}

function isSortedLightToDark(colors: string[]): boolean {
  const lightnesses = colors.map((color) => toOklch(color).l)
  return lightnesses.every(
    (lightness, index) => index === 0 || lightness <= lightnesses[index - 1],
  )
}

/** The six tones after the page text color in first place. */
function themeTones(background: string): string[] {
  return deriveCozyThemeColors(
    background,
    deriveCozyTextColor(background),
  ).slice(1)
}

describe.each(Object.entries(ALL_BACKGROUNDS))(
  'cozy palette on %s',
  (_name, background) => {
    const page = toOklch(background)
    const textColor = deriveCozyTextColor(background)
    const themeColors = deriveCozyThemeColors(background, textColor)

    it('gives seven valid colors: the page text color, then six distinct tones', () => {
      expect(themeColors).toHaveLength(7)
      for (const color of themeColors) expect(color).toMatch(/^#[0-9a-f]{6}$/)
      expect(themeColors[0]).toBe(textColor)
      expect(new Set(themeColors.slice(1)).size).toBe(6)
    })

    it('gives a gentle, readable text color in the right direction', () => {
      const { l, c } = toOklch(textColor)
      expect(c).toBeLessThanOrEqual(0.16)
      expect(l).toBeGreaterThanOrEqual(0.25)
      expect(l).toBeLessThanOrEqual(0.95)
      const lightnessGap = l - page.l
      expect(Math.abs(lightnessGap)).toBeGreaterThanOrEqual(0.18)
      // Darker text on light pages, lighter text on dark pages
      expect(Math.sign(lightnessGap)).toBe(page.l > 0.6 ? -1 : 1)
    })
  },
)

describe.each(Object.entries(COLORFUL_BACKGROUNDS))(
  'cozy palette on colorful %s',
  (_name, background) => {
    const page = toOklch(background)
    const tones = themeTones(background)

    it('never goes harsh: no neon, near-black or near-white', () => {
      for (const color of tones) {
        const { l, c } = toOklch(color)
        expect(c).toBeLessThanOrEqual(0.16)
        expect(l).toBeGreaterThanOrEqual(0.25)
        expect(l).toBeLessThanOrEqual(0.95)
      }
    })

    it('orders tones light to dark', () => {
      expect(isSortedLightToDark(tones)).toBe(true)
    })

    it('keeps the text color in the page hue', () => {
      expect(
        hueDistance(
          toOklch(deriveCozyTextColor(background)).h ?? 0,
          page.h ?? 0,
        ),
      ).toBeLessThan(8)
    })

    it('keeps tones near the page hue, never drifting to an unrelated color', () => {
      for (const color of tones) {
        expect(
          hueDistance(toOklch(color).h ?? 0, page.h ?? 0),
        ).toBeLessThanOrEqual(26)
      }
    })

    it('includes a cluster of three close cousins of the page color', () => {
      const closeToPage = tones.filter(
        (color) => hueDistance(toOklch(color).h ?? 0, page.h ?? 0) <= 8,
      )
      expect(closeToPage.length).toBeGreaterThanOrEqual(3)
    })
  },
)

describe.each(Object.entries(NEUTRAL_BACKGROUNDS))(
  'cozy palette on neutral %s',
  (_name, background) => {
    const page = toOklch(background)
    const textColor = deriveCozyTextColor(background)
    const tones = themeTones(background)
    const isNearBlack = page.l < 0.2
    const greys = isNearBlack ? tones : tones.slice(1)

    it('keeps a warm text color instead of flat grey', () => {
      expect(toOklch(textColor).c).toBeGreaterThan(0.01)
    })

    it(`uses ${isNearBlack ? 'only greys' : 'a warm light accent, then greys'}`, () => {
      if (!isNearBlack) expect(toOklch(tones[0]).c).toBeGreaterThan(0.01)
      expect(greys).toHaveLength(isNearBlack ? 6 : 5)
      for (const color of greys) expect(toOklch(color).c).toBeLessThan(0.005)
    })

    it('places greys between the page and the text color, light to dark', () => {
      const [low, high] = [page.l, toOklch(textColor).l].sort(
        (first, second) => first - second,
      )
      for (const color of greys) {
        expect(toOklch(color).l).toBeGreaterThan(low)
        expect(toOklch(color).l).toBeLessThan(high)
      }
      expect(isSortedLightToDark(greys)).toBe(true)
    })
  },
)

describe('cozy theme tones', () => {
  it('match the hand-picked shades on a burgundy page', () => {
    // Picked by eye as the target look: mauve, orchid, raspberry, plum, wine.
    const handPicked = ['#b5778b', '#b56aa5', '#a8395b', '#7e2252', '#561a2d']
    const distance = differenceEuclidean('oklab')
    const tones = themeTones(COLORFUL_BACKGROUNDS.burgundy)
    for (const pickedColor of handPicked) {
      const closest = Math.min(
        ...tones.map((color) => distance(color, pickedColor)),
      )
      expect(closest).toBeLessThan(0.03)
    }
  })

  it('skip the warm accent on pure black, keeping only greys', () => {
    for (const color of themeTones(NEUTRAL_BACKGROUNDS.black)) {
      expect(toOklch(color).c).toBeLessThan(0.005)
    }
  })

  it('stay rich on a pale page instead of greying out', () => {
    for (const color of themeTones(COLORFUL_BACKGROUNDS.dustyRose)) {
      expect(toOklch(color).c).toBeGreaterThan(0.04)
    }
  })
})

describe.each(Object.entries(COLORFUL_BACKGROUNDS))(
  'background for the text color on colorful %s',
  (_name, background) => {
    it('gives about that page back', () => {
      const roundTrip = deriveCozyBackgroundColor(
        deriveCozyTextColor(background),
      )
      expect(differenceEuclidean('oklch')(roundTrip, background)).toBeLessThan(
        0.06,
      )
    })
  },
)

const TEXT_COLORS = {
  ink: '#2a2420',
  cream: '#f3ead8',
  vividRed: '#ff0000',
  vividBlue: '#0000ff',
  grey: '#808080',
  white: '#ffffff',
  black: '#000000',
}

describe.each(Object.entries(TEXT_COLORS))(
  'background for the text color %s',
  (_name, textColor) => {
    const text = toOklch(textColor)
    const page = toOklch(deriveCozyBackgroundColor(textColor))

    it('sits on the other side of the text, far enough to read', () => {
      const lightnessGap = page.l - text.l
      expect(Math.sign(lightnessGap)).toBe(text.l > 0.6 ? -1 : 1)
      expect(Math.abs(lightnessGap)).toBeGreaterThanOrEqual(0.18)
    })

    it('is never neon, even for vivid text', () => {
      expect(page.c).toBeLessThanOrEqual(0.12)
    })
  },
)

describe('suggested page colors', () => {
  it.each(Object.entries(ALL_BACKGROUNDS))(
    'offers distinct text colors for %s, stepping away from the page',
    (_name, background) => {
      const suggestions = deriveCozyTextColors(background)
      expect(new Set(suggestions).size).toBe(suggestions.length)
      const distances = suggestions.map((color) =>
        Math.abs(toOklch(color).l - toOklch(background).l),
      )
      expect(distances).toEqual([...distances].sort((a, b) => a - b))
    },
  )

  // Well above the old cap (~0.055) that greyed them out; the darkest give up some to fit the screen's gamut.
  it('offers page colors as rich as a rich text color, not greyed out', () => {
    deriveCozyBackgroundColors('#de7aa0').forEach((color) =>
      expect(toOklch(color).c).toBeGreaterThan(0.07),
    )
  })

  it.each(Object.entries(TEXT_COLORS))(
    'offers distinct page colors for the text color %s',
    (_name, textColor) => {
      const suggestions = deriveCozyBackgroundColors(textColor)
      expect(new Set(suggestions).size).toBeGreaterThan(1)
      suggestions.forEach((color) => expect(color).toMatch(/^#[0-9a-f]{6}$/))
    },
  )
})

describe('theme colors for a see-through text color', () => {
  it('keep the text color itself first, and place greys by how it looks', () => {
    const [pageText, ...tones] = deriveCozyThemeColors('#ffffff', '#00000080')
    expect(pageText).toBe('#00000080')
    expect(tones).toEqual(deriveCozyThemeColors('#ffffff', '#7f7f7f').slice(1))
  })
})
