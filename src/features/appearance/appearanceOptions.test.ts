import tokensCss from '../../design-system/tokens.css?raw'
import { LINE_SPACING_OPTIONS } from './appearanceOptions'

function readToken(name: string): string {
  const match = tokensCss.match(new RegExp(`--${name}:\\s*([^;]+);`))
  if (!match) throw new Error(`Missing design token --${name}`)
  return match[1].trim()
}

/* Labels claim real values, so they must match the tokens that render them. */
describe('line spacing labels', () => {
  it.each(LINE_SPACING_OPTIONS)(
    '$value is labeled with its multiplier',
    ({ value, label }) => {
      expect(parseFloat(label)).toBe(
        parseFloat(readToken(`line-height-${value}`)),
      )
    },
  )
})
