import { interpolate, formatHex, wcagContrast } from 'culori'
import { deriveReadableMutedColor } from './readableMuted'

const PALETTES = {
  oat: ['#ede3d6', '#594a36'],
  cocoa: ['#2b211c', '#c1aba1'],
  dustyRose: ['#f0dfdb', '#4a3236'],
  burgundy: ['#6e2340', '#f1cbd5'],
  highContrast: ['#ffffff', '#000000'],
}

describe('deriveReadableMutedColor', () => {
  it.each(Object.entries(PALETTES))(
    'reads at 4.5:1 on every surface: %s',
    (_name, [background, text]) => {
      const muted = deriveReadableMutedColor(background, text)
      for (const share of [0, 0.05, 0.1]) {
        const surface = formatHex(interpolate([background, text], 'rgb')(share))
        expect(wcagContrast(muted, surface)).toBeGreaterThanOrEqual(4.5)
      }
    },
  )

  it('stays softer than the text when there is room', () => {
    expect(deriveReadableMutedColor('#ffffff', '#000000')).not.toBe('#000000')
  })

  it('falls back to the text color when nothing softer is readable', () => {
    expect(deriveReadableMutedColor('#777777', '#888888')).toBe('#888888')
  })
})

describe('a see-through text color', () => {
  it('is judged by how it looks on the page', () => {
    expect(deriveReadableMutedColor('#ffffff', '#00000080')).toBe(
      deriveReadableMutedColor('#ffffff', '#7f7f7f'),
    )
  })
})
