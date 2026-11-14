import { z } from 'zod'
import {
  backUpRawValue,
  findStoredKeys,
  getBackupKeyPrefix,
  readRawValue,
  readStoredValue,
  removeStoredValue,
  writeStoredValue,
} from './localStore'

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

  it('finds backups by their prefix, and removes keys', () => {
    backUpRawValue('journal', '{oops')
    const [backupKey] = findStoredKeys(getBackupKeyPrefix('journal'))
    expect(readRawValue(backupKey)).toBe('{oops')
    expect(removeStoredValue(backupKey)).toBe(true)
    expect(findStoredKeys(getBackupKeyPrefix('journal'))).toEqual([])
  })
})
