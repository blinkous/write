import { DEFAULT_APPEARANCE } from './appearanceOptions'
import { loadAppearance } from './appearanceStorage'

describe('loadAppearance', () => {
  beforeEach(() => window.localStorage.clear())

  it('keeps saved settings and fills in settings added since they were saved', () => {
    const savedBeforeSpacing = {
      font: 'inter',
      textSize: 'large',
      margins: 'wide',
      backgroundColor: '#112233',
      textColor: '#eeddcc',
    }
    window.localStorage.setItem(
      'write.appearance.v1',
      JSON.stringify(savedBeforeSpacing),
    )
    const { textSize: _droppedSetting, ...savedSettings } = savedBeforeSpacing
    expect(loadAppearance()).toEqual({
      ...savedSettings,
      lineSpacing: DEFAULT_APPEARANCE.lineSpacing,
      hasParagraphSpacing: DEFAULT_APPEARANCE.hasParagraphSpacing,
      hasParagraphIndent: DEFAULT_APPEARANCE.hasParagraphIndent,
      customTextColors: Array(7).fill(null),
    })
  })

  it.each([
    ['none', false],
    ['small', true],
    ['normal', true],
    ['large', true],
  ])(
    'migrates the old paragraph gap "%s" to spacing %s',
    (oldGap, hasParagraphSpacing) => {
      window.localStorage.setItem(
        'write.appearance.v1',
        JSON.stringify({
          ...DEFAULT_APPEARANCE,
          hasParagraphSpacing: undefined,
          paragraphSpacing: oldGap,
        }),
      )
      expect(loadAppearance().hasParagraphSpacing).toBe(hasParagraphSpacing)
    },
  )

  it('migrates once: saved settings are used as-is and lose the old field', () => {
    window.localStorage.setItem(
      'write.appearance.v1',
      JSON.stringify({
        ...DEFAULT_APPEARANCE,
        hasParagraphSpacing: false,
        paragraphSpacing: 'large',
      }),
    )
    const loaded = loadAppearance()
    expect(loaded.hasParagraphSpacing).toBe(false)
    expect(loaded).not.toHaveProperty('paragraphSpacing')
  })

  it('replaces only the invalid setting', () => {
    window.localStorage.setItem(
      'write.appearance.v1',
      JSON.stringify({
        ...DEFAULT_APPEARANCE,
        font: 'comic-sans',
        lineSpacing: 'loose',
      }),
    )
    expect(loadAppearance()).toMatchObject({
      font: DEFAULT_APPEARANCE.font,
      lineSpacing: 'loose',
    })
  })

  it('keeps saved custom colors, always as seven slots', () => {
    window.localStorage.setItem(
      'write.appearance.v1',
      JSON.stringify({
        ...DEFAULT_APPEARANCE,
        customTextColors: ['#b03a48', 'not-a-color'],
      }),
    )
    expect(loadAppearance().customTextColors).toEqual([
      '#b03a48',
      ...Array(6).fill(null),
    ])
  })
})
