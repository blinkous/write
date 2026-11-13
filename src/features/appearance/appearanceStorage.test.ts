import {
  DEFAULT_APPEARANCE,
  DEFAULT_PAGE_COLORS,
  TAB_TITLE_MAX_LENGTH,
} from './appearanceOptions'
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
    const {
      textSize: _droppedSetting,
      font: legacyFont,
      ...savedSettings
    } = savedBeforeSpacing
    expect(loadAppearance()).toEqual({
      ...savedSettings,
      // The one old font was the writing's; the app font starts at its default.
      editorFont: legacyFont,
      appFont: DEFAULT_APPEARANCE.appFont,
      lineSpacing: DEFAULT_APPEARANCE.lineSpacing,
      hasParagraphSpacing: DEFAULT_APPEARANCE.hasParagraphSpacing,
      hasParagraphIndent: DEFAULT_APPEARANCE.hasParagraphIndent,
      customTextColors: Array(7).fill(null),
      textStyles: DEFAULT_APPEARANCE.textStyles,
      tabTitle: DEFAULT_APPEARANCE.tabTitle,
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
        appFont: 'comic-sans',
        lineSpacing: 'loose',
      }),
    )
    expect(loadAppearance()).toMatchObject({
      appFont: DEFAULT_APPEARANCE.appFont,
      lineSpacing: 'loose',
    })
  })

  it('keeps a saved tab title, and drops one too long to be a title', () => {
    const save = (tabTitle: string) =>
      window.localStorage.setItem(
        'write.appearance.v1',
        JSON.stringify({ ...DEFAULT_APPEARANCE, tabTitle }),
      )
    save('Morning pages')
    expect(loadAppearance().tabTitle).toBe('Morning pages')
    save('x'.repeat(TAB_TITLE_MAX_LENGTH + 1))
    expect(loadAppearance().tabTitle).toBe(DEFAULT_APPEARANCE.tabTitle)
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

  it('prefers a saved entry font over the old single font', () => {
    window.localStorage.setItem(
      'write.appearance.v1',
      JSON.stringify({
        font: 'inter',
        editorFont: 'literata',
        appFont: 'nunito',
      }),
    )
    expect(loadAppearance()).toMatchObject({
      editorFont: 'literata',
      appFont: 'nunito',
    })
  })

  it('starts a first visit in the system mode: oat when light, cocoa when dark', () => {
    expect(loadAppearance('light')).toMatchObject(DEFAULT_PAGE_COLORS.light)
    expect(loadAppearance('dark')).toMatchObject(DEFAULT_PAGE_COLORS.dark)
  })

  it('keeps saved colors whatever the system mode', () => {
    window.localStorage.setItem(
      'write.appearance.v1',
      JSON.stringify({ backgroundColor: '#112233', textColor: '#eeddcc' }),
    )
    expect(loadAppearance('dark')).toMatchObject({
      backgroundColor: '#112233',
      textColor: '#eeddcc',
    })
  })

  it('matches a text color to a saved background that lost its own', () => {
    window.localStorage.setItem(
      'write.appearance.v1',
      JSON.stringify({ backgroundColor: '#2b211c', textColor: 'nope' }),
    )
    expect(loadAppearance('light')).toMatchObject(DEFAULT_PAGE_COLORS.dark)
  })
})
