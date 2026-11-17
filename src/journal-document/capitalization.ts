export const TEXT_CASES = ['upper', 'lower', 'title', 'sentence'] as const
export type TextCase = (typeof TEXT_CASES)[number]

/**
 * What text can store as its own case: a case, or `as-typed`, which shows the
 * letters as typed where its text style has a case.
 */
export const AS_TYPED_CASE = 'as-typed'
export type OwnTextCase = TextCase | typeof AS_TYPED_CASE

export function isOwnTextCase(value: unknown): value is OwnTextCase {
  return value === AS_TYPED_CASE || isTextCase(value)
}

export function isTextCase(value: unknown): value is TextCase {
  return TEXT_CASES.some((textCase) => textCase === value)
}

const LETTER = /\p{L}/u
const DIGIT = /\p{N}/u
const WORD_CHARACTER = /[\p{L}\p{N}'’]/u
const SENTENCE_END = /[.!?…]/u
const WHITESPACE = /\s/u

/**
 * UTF-16 offsets of letters that start a word (title case) or a sentence
 * (sentence case) in a block of text. Everything else displays lowercase.
 */
export function findCapitalOffsets(
  text: string,
  textCase: 'title' | 'sentence',
): number[] {
  const capitalOffsets: number[] = []
  let previousCharacter = ''
  let isAtSentenceStart = true
  let hasSentenceEnded = false
  let offset = 0

  for (const character of text) {
    if (LETTER.test(character)) {
      const startsWord = !WORD_CHARACTER.test(previousCharacter)
      if (textCase === 'title' ? startsWord : isAtSentenceStart)
        capitalOffsets.push(offset)
      isAtSentenceStart = false
      hasSentenceEnded = false
    } else if (SENTENCE_END.test(character)) {
      hasSentenceEnded = true
    } else if (WHITESPACE.test(character) && hasSentenceEnded) {
      isAtSentenceStart = true
      hasSentenceEnded = false
    } else if (DIGIT.test(character)) {
      isAtSentenceStart = false
      hasSentenceEnded = false
    }
    previousCharacter = character
    offset += character.length
  }
  return capitalOffsets
}
