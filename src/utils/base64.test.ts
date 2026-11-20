import { base64ToBytes, bytesToBase64 } from './base64'

describe('base64', () => {
  it('round-trips bytes, long ones included', () => {
    const bytes = Uint8Array.from(
      { length: 100_000 },
      (_, index) => index % 256,
    )
    const base64 = bytesToBase64(bytes)
    expect(base64.startsWith('AAECAwQF')).toBe(true)
    expect(base64ToBytes(base64)).toEqual(bytes)
  })

  it('rejects what isn’t base64', () => {
    expect(base64ToBytes('not base64!')).toBeNull()
  })
})
