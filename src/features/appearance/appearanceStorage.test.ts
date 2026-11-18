import {
  DEFAULT_APPEARANCE,
  DEFAULT_PAGE_COLORS,
  TAB_TITLE_MAX_LENGTH,
} from './appearanceOptions'
import { getSaveFailure, reportSaveResult } from '../../lib/saveStatus'
import {
  getFirstVisitAppearance,
  loadAppearance,
  saveAppearance,
} from './appearanceStorage'

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
      backgroundBlur: DEFAULT_APPEARANCE.backgroundBlur,
      backgroundOpacity: DEFAULT_APPEARANCE.backgroundOpacity,
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

  it('keeps saved background blur and opacity, and drops ones out of range', () => {
    const save = (backgroundBlur: number, backgroundOpacity: number) =>
      window.localStorage.setItem(
        'write.appearance.v1',
        JSON.stringify({
          ...DEFAULT_APPEARANCE,
          backgroundBlur,
          backgroundOpacity,
        }),
      )
    save(12, 70)
    expect(loadAppearance()).toMatchObject({
      backgroundBlur: 12,
      backgroundOpacity: 70,
    })
    save(-4, 140)
    expect(loadAppearance()).toMatchObject({
      backgroundBlur: DEFAULT_APPEARANCE.backgroundBlur,
      backgroundOpacity: DEFAULT_APPEARANCE.backgroundOpacity,
    })
  })

  it('turns a saved background fade into its opposite opacity, once', () => {
    const { backgroundOpacity: _opacity, ...savedWithFade } = {
      ...DEFAULT_APPEARANCE,
      backgroundFade: 30,
    }
    window.localStorage.setItem(
      'write.appearance.v1',
      JSON.stringify(savedWithFade),
    )
    const migrated = loadAppearance()
    expect(migrated.backgroundOpacity).toBe(70)
    expect(migrated).not.toHaveProperty('backgroundFade')
    window.localStorage.setItem('write.appearance.v1', JSON.stringify(migrated))
    expect(loadAppearance().backgroundOpacity).toBe(70)
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

  it('starts a first visit in the system mode: oat when light, charcoal when dark', () => {
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

  it('keeps a see-through text color, but never a see-through background', () => {
    window.localStorage.setItem(
      'write.appearance.v1',
      JSON.stringify({ backgroundColor: '#11223380', textColor: '#eeddcc80' }),
    )
    expect(loadAppearance('dark')).toMatchObject(DEFAULT_PAGE_COLORS.dark)
    window.localStorage.setItem(
      'write.appearance.v1',
      JSON.stringify({ backgroundColor: '#112233', textColor: '#eeddcc80' }),
    )
    expect(loadAppearance('dark').textColor).toBe('#eeddcc80')
  })

  it('matches a text color to a saved background that lost its own', () => {
    window.localStorage.setItem(
      'write.appearance.v1',
      JSON.stringify({ backgroundColor: '#2b211c', textColor: 'nope' }),
    )
    // Cocoa's cozy match.
    expect(loadAppearance('light')).toMatchObject({
      backgroundColor: '#2b211c',
      textColor: '#c1aba1',
    })
  })
})

describe('saving the appearance', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    reportSaveResult('appearance', true)
  })

  it('reports a failed save (e.g. full storage) instead of ignoring it', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError')
    })
    saveAppearance(DEFAULT_APPEARANCE)
    expect(getSaveFailure()).not.toBeNull()
  })
})

describe('getFirstVisitAppearance', () => {
  beforeEach(() => window.localStorage.clear())

  it('is what a first visit loads, in light or dark mode', () => {
    expect(getFirstVisitAppearance('light')).toEqual(loadAppearance('light'))
    expect(getFirstVisitAppearance('dark')).toEqual(loadAppearance('dark'))
    expect(getFirstVisitAppearance('dark')).toMatchObject(
      DEFAULT_PAGE_COLORS.dark,
    )
  })

  it('ignores saved settings', () => {
    window.localStorage.setItem(
      'write.appearance.v1',
      JSON.stringify({ margins: 'wide', tabTitle: 'Mine' }),
    )
    expect(getFirstVisitAppearance('light')).toMatchObject({
      margins: DEFAULT_APPEARANCE.margins,
      tabTitle: DEFAULT_APPEARANCE.tabTitle,
    })
  })
})
