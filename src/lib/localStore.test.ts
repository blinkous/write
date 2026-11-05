import { z } from 'zod'
import { readStoredValue, writeStoredValue } from './localStore'

const numberListSchema = z.array(z.number())

describe('localStore', () => {
  beforeEach(() => window.localStorage.clear())

  it('round-trips a valid value', () => {
    writeStoredValue('numbers', [1, 2])
    expect(readStoredValue('numbers', numberListSchema, [])).toEqual([1, 2])
  })

  it('returns the fallback without reporting when the key is missing', () => {
    const onInvalidValue = vi.fn()
    expect(
      readStoredValue('missing', numberListSchema, [], { onInvalidValue }),
    ).toEqual([])
    expect(onInvalidValue).not.toHaveBeenCalled()
  })

  it('reports the raw value when it fails validation or is malformed JSON', () => {
    const onInvalidValue = vi.fn()
    window.localStorage.setItem('wrong-shape', '["a"]')
    window.localStorage.setItem('not-json', '{oops')
    readStoredValue('wrong-shape', numberListSchema, [], { onInvalidValue })
    readStoredValue('not-json', numberListSchema, [], { onInvalidValue })
    expect(onInvalidValue.mock.calls).toEqual([['["a"]'], ['{oops']])
  })
})
