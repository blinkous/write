import { findCapitalOffsets } from './capitalization'

function applyCase(text: string, textCase: 'title' | 'sentence'): string {
  const capitalOffsets = new Set(findCapitalOffsets(text, textCase))
  let offset = 0
  return [...text]
    .map((character) => {
      const displayed = capitalOffsets.has(offset)
        ? character.toUpperCase()
        : character.toLowerCase()
      offset += character.length
      return displayed
    })
    .join('')
}

describe('findCapitalOffsets', () => {
  it('title-cases every word, leaving contractions alone', () => {
    expect(applyCase("it's a rAINY day-time (really)", 'title')).toBe(
      "It's A Rainy Day-Time (Really)",
    )
  })

  it('sentence-cases the first letter of each sentence', () => {
    expect(applyCase('HELLO THERE. how are you? "fine!" ok', 'sentence')).toBe(
      'Hello there. How are you? "Fine!" Ok',
    )
  })

  it('does not treat decimals or numbers as sentence ends', () => {
    expect(applyCase('it costs 3.50 today. 2 apples', 'sentence')).toBe(
      'It costs 3.50 today. 2 apples',
    )
  })

  it('handles text that is not all single code units', () => {
    expect(applyCase('🌧 rain. sun', 'sentence')).toBe('🌧 Rain. Sun')
  })
})
