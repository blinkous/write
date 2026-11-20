/* Built in on newer browsers (Safari 18.2, Chrome 140, Firefox 133), not yet in TypeScript's types; the fallbacks cover older browsers. */
declare global {
  interface Uint8Array {
    toBase64?: () => string
  }
  interface Uint8ArrayConstructor {
    fromBase64?: (base64: string) => Uint8Array<ArrayBuffer>
  }
}

/* String.fromCharCode takes its bytes as arguments, so long files go in chunks. */
const CHUNK_BYTES = 0x8000

export function bytesToBase64(bytes: Uint8Array): string {
  if (bytes.toBase64) return bytes.toBase64()
  let binary = ''
  for (let start = 0; start < bytes.length; start += CHUNK_BYTES)
    binary += String.fromCharCode(...bytes.subarray(start, start + CHUNK_BYTES))
  return btoa(binary)
}

/** The bytes, or null if it isn't base64. */
export function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> | null {
  try {
    if (Uint8Array.fromBase64) return Uint8Array.fromBase64(base64)
    return Uint8Array.from(atob(base64), (character) =>
      character.charCodeAt(0),
    )
  } catch {
    return null
  }
}
