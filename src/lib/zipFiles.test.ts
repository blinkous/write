// @vitest-environment node
// jsdom's TextEncoder makes arrays from another realm, which fflate takes for folders; browsers don't.
import { strFromU8, unzipSync } from 'fflate'
import { zipFiles } from './zipFiles'

describe('zipFiles', () => {
  it('zips text and bytes under their paths', async () => {
    const zip = zipFiles([
      { path: 'journal.md', contents: '# Hello' },
      { path: 'images/cat.gif', contents: new Uint8Array([1, 2, 3]) },
    ])
    expect(zip.type).toBe('application/zip')
    const files = unzipSync(new Uint8Array(await zip.arrayBuffer()))
    expect(strFromU8(files['journal.md'])).toBe('# Hello')
    expect([...files['images/cat.gif']]).toEqual([1, 2, 3])
  })
})
