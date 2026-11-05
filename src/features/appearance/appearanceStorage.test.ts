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
    expect(loadAppearance()).toEqual({
      ...savedBeforeSpacing,
      lineSpacing: DEFAULT_APPEARANCE.lineSpacing,
      paragraphSpacing: DEFAULT_APPEARANCE.paragraphSpacing,
    })
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
})
