import { render } from '@testing-library/react'
import { HexAlphaColorPicker } from 'react-colorful'
import { REACT_COLORFUL_STYLE_HASH } from './contentSecurityPolicy'

describe('the Content Security Policy', () => {
  it("allows react-colorful's stylesheet by its exact contents", async () => {
    render(<HexAlphaColorPicker color="#ffffff" />)
    const [injectedStyle] = [...document.querySelectorAll('style')].filter(
      (style) => style.textContent.includes('.react-colorful'),
    )
    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(injectedStyle?.textContent ?? ''),
    )
    const hash = btoa(String.fromCharCode(...new Uint8Array(digest)))
    expect(REACT_COLORFUL_STYLE_HASH).toBe(`'sha256-${hash}'`)
  })
})
