import { strToU8, zipSync, type Zippable } from 'fflate'

export type ZipEntry = {
  /** Where it goes in the zip, e.g. "images/cat.gif". */
  path: string
  contents: string | Uint8Array
}

/*
 * Pictures and videos are compressed already, so they're stored as is: faster,
 * and no bigger. Text is compressed. Zipped on the page rather than in a
 * worker, which the app's security policy doesn't allow.
 */
const ALREADY_COMPRESSED = /\.(png|jpe?g|gif|webp|avif|mp4|webm|mov)$/i

/** One .zip of the files. */
export function zipFiles(entries: readonly ZipEntry[]): Blob {
  const zippable: Zippable = {}
  for (const { path, contents } of entries) {
    const bytes = typeof contents === 'string' ? strToU8(contents) : contents
    zippable[path] = [bytes, { level: ALREADY_COMPRESSED.test(path) ? 0 : 6 }]
  }
  return new Blob([zipSync(zippable).slice()], { type: 'application/zip' })
}
