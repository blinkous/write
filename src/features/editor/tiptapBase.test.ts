import { Editor } from '@tiptap/core'
import vendoredCss from './tiptapBase.css?raw'
import { editorExtensions } from './editorExtensions'

function normalizeCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

describe('tiptapBase.css', () => {
  it('matches the styles the installed @tiptap/core would inject', () => {
    new Editor({ extensions: editorExtensions, injectCSS: true })
    const injectedCss =
      document.querySelector('style[data-tiptap-style]')?.textContent ?? ''
    expect(injectedCss).not.toBe('')
    expect(normalizeCss(vendoredCss)).toBe(normalizeCss(injectedCss))
  })
})
