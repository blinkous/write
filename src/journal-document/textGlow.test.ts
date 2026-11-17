import { createTestEditor } from '../test/createTestEditor'
import { documentExtensions } from './documentExtensions'
import { resolveTextGlow } from './textGlow'

describe('resolveTextGlow', () => {
  it('turns a theme or hex color into a glow that scales with the text', () => {
    expect(resolveTextGlow('theme-3')).toMatch(
      /^0 0 0\.02em var\(--color-theme-3\), .* 0 0 1\.2em var\(--color-theme-3\)$/,
    )
    expect(resolveTextGlow('#ff2fa0')).toContain('0 0 1.2em #ff2fa0')
  })

  it('ignores anything else, e.g. from an imported file', () => {
    expect(resolveTextGlow('red; color: blue')).toBeNull()
    expect(resolveTextGlow(null)).toBeNull()
  })
})

describe('text glow commands', () => {
  const glowsInDocument = (
    html: string,
    run: (editor: ReturnType<typeof createTestEditor>) => void,
  ) => {
    const editor = createTestEditor({
      extensions: documentExtensions,
      content: html,
    })
    editor.commands.selectAll()
    run(editor)
    return editor.getHTML().match(/data-glow="[^"]*"/g) ?? []
  }

  it('sets a glow and keeps it when pasted back in', () => {
    expect(
      glowsInDocument('<p>hi</p>', (editor) =>
        editor.commands.setTextGlow('theme-4'),
      ),
    ).toEqual(['data-glow="theme-4"'])
    expect(
      glowsInDocument('<p><span data-glow="#ff2fa0">hi</span></p>', () => {}),
    ).toEqual(['data-glow="#ff2fa0"'])
  })

  it("drops glows that aren't colors and unsets back to no glow", () => {
    expect(
      glowsInDocument('<p><span data-glow="red; x">hi</span></p>', () => {}),
    ).toEqual([])
    expect(
      glowsInDocument('<p><span data-glow="theme-2">hi</span></p>', (editor) =>
        editor.commands.unsetTextGlow(),
      ),
    ).toEqual([])
  })

  it('keeps the text color separate from the glow', () => {
    const editor = createTestEditor({
      extensions: documentExtensions,
      content: '<p>hi</p>',
    })
    editor.commands.selectAll()
    editor.chain().setColor('#ffffff').setTextGlow('#ff2fa0').run()
    editor.commands.unsetTextGlow()
    expect(editor.getAttributes('textStyle')).toMatchObject({
      color: '#ffffff',
      glow: null,
    })
  })
})
