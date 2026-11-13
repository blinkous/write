import tokensCss from '../design-system/tokens.css?raw'
import {
  DEFAULT_TEXT_STYLES,
  getTextStyleVariables,
  TEXT_STYLE_NAMES,
  textStylesSchema,
} from './textStyleSettings'

describe('text style settings', () => {
  it('reads nothing as the defaults', () => {
    expect(textStylesSchema.parse(undefined)).toEqual(DEFAULT_TEXT_STYLES)
  })

  it('keeps good settings and resets only the bad ones', () => {
    const parsed = textStylesSchema.parse({
      'heading-2': {
        size: 32,
        bold: 'yes',
        italic: true,
        font: 'inter',
        color: 'theme-3',
      },
      body: { size: 999, font: 'comic-sans', color: 'red; x' },
    })
    expect(parsed['heading-2']).toEqual({
      size: 32,
      bold: true,
      italic: true,
      underline: false,
      strike: false,
      letterSpacing: 0,
      font: 'inter',
      color: 'theme-3',
    })
    expect(parsed.body).toEqual(DEFAULT_TEXT_STYLES.body)
  })

  it('turns settings into CSS: sizes in rem, defaults following the editor font and page text', () => {
    const variables = getTextStyleVariables({
      ...DEFAULT_TEXT_STYLES,
      'heading-2': {
        size: 32,
        bold: false,
        italic: true,
        underline: true,
        strike: true,
        letterSpacing: 5,
        font: 'inter',
        color: 'theme-3',
      },
    })
    expect(variables['--text-style-heading-2-size']).toBe('2rem')
    expect(variables['--text-style-heading-2-scale']).toBe('2')
    expect(variables['--text-style-heading-2-weight']).toBe(
      'var(--font-weight-regular)',
    )
    expect(variables['--text-style-heading-2-style']).toBe('italic')
    expect(variables['--text-style-heading-2-letter-spacing']).toBe('0.05em')
    expect(variables['--text-style-heading-2-decoration']).toBe(
      'underline line-through',
    )
    expect(variables['--text-style-heading-2-font']).toContain('Inter')
    expect(variables['--text-style-heading-2-color']).toBe(
      'var(--color-theme-3)',
    )
    expect(variables['--text-style-body-font']).toBe('var(--font-editor)')
    expect(variables['--text-style-body-color']).toBe('var(--color-text)')
  })

  it('matches the defaults in tokens.css, so the first paint looks right', () => {
    const variables = getTextStyleVariables(DEFAULT_TEXT_STYLES)
    for (const name of TEXT_STYLE_NAMES) {
      for (const property of [
        'size',
        'scale',
        'weight',
        'style',
        'decoration',
        'letter-spacing',
        'font',
        'color',
      ]) {
        const variable = `--text-style-${name}-${property}`
        expect(tokensCss).toContain(`${variable}: ${variables[variable]};`)
      }
    }
  })
})
