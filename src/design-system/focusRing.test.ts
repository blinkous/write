// Reads the stylesheets from disk, which only tests (run in Node) can.
/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/*
 * Focus rings follow the app's own keyboard tracking (inputModality.ts, see
 * the app spec): browsers' :focus-visible misses focus the app moves
 * (dialogs' Tab in WebKit), so no stylesheet may rely on it.
 */
const SOURCE_DIRECTORY = join(import.meta.dirname, '..')

function readStylesheets(): [path: string, css: string][] {
  return readdirSync(SOURCE_DIRECTORY, { recursive: true, encoding: 'utf8' })
    .filter((path) => path.endsWith('.css'))
    .map((path) => [path, readFileSync(join(SOURCE_DIRECTORY, path), 'utf8')])
}

function withoutComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

describe('focus rings', () => {
  it('never depend on :focus-visible', () => {
    const stylesheets = readStylesheets()
    const offenders = stylesheets
      .filter(([, css]) => withoutComments(css).includes(':focus-visible'))
      .map(([path]) => path)
    expect(stylesheets.length).toBeGreaterThan(10)
    expect(offenders).toEqual([])
  })
})
