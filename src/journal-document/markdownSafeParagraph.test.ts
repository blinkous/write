import { escapeParagraphLineStarts } from './markdownSafeParagraph'

describe('escapeParagraphLineStarts', () => {
  it.each([
    ['# not a heading', '\\# not a heading'],
    ['### also not', '\\### also not'],
    ['- not a bullet', '\\- not a bullet'],
    ['+ not a bullet', '\\+ not a bullet'],
    ['1. not a list', '1\\. not a list'],
    ['12) not a list', '12\\) not a list'],
    ['---', '\\---'],
    ['- - -', '\\- - -'],
    ['===', '\\==='],
    ['```js', '\\```js'],
  ])('escapes %j', (input, expected) => {
    expect(escapeParagraphLineStarts(input)).toBe(expected)
  })

  it('leaves ordinary text alone', () => {
    for (const text of [
      '#hashtag',
      '-dash',
      '2024 was good',
      'a - b',
      'Wow!',
      '1.5 cups',
    ]) {
      expect(escapeParagraphLineStarts(text)).toBe(text)
    }
  })

  it('escapes every line, since structure can start after a line break', () => {
    expect(escapeParagraphLineStarts('Line one  \n# second line')).toBe(
      'Line one  \n\\# second line',
    )
  })

  it('keeps a deep indent visible without making a code block', () => {
    expect(escapeParagraphLineStarts('    indented')).toBe('    indented')
  })
})
