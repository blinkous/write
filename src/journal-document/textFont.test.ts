import { createTestEditor } from '../test/createTestEditor'
import { documentExtensions } from './documentExtensions'
import { resolveTextFont } from './textFont'

describe('resolveTextFont', () => {
  it('maps a bundled font name to its CSS family', () => {
    expect(resolveTextFont('inter')).toContain('Inter')
  })

  it('ignores anything else, e.g. from an imported file', () => {
    expect(resolveTextFont('Comic Sans; color: red')).toBeNull()
    expect(resolveTextFont(null)).toBeNull()
  })
})

describe('text font commands', () => {
  const fontsInDocument = (
    html: string,
    run: (editor: ReturnType<typeof createTestEditor>) => void,
  ) => {
    const editor = createTestEditor({
      extensions: documentExtensions,
      content: html,
    })
    editor.commands.selectAll()
    run(editor)
    return editor.getHTML().match(/data-font="[^"]*"/g) ?? []
  }

  it('sets a font by name and keeps it when pasted back in', () => {
    expect(
      fontsInDocument('<p>hi</p>', (editor) =>
        editor.commands.setTextFont('comforter'),
      ),
    ).toEqual(['data-font="comforter"'])
    expect(
      fontsInDocument('<p><span data-font="comforter">hi</span></p>', () => {}),
    ).toEqual(['data-font="comforter"'])
  })

  it('drops unknown fonts and unsets back to the editor font', () => {
    expect(
      fontsInDocument('<p><span data-font="evil">hi</span></p>', () => {}),
    ).toEqual([])
    expect(
      fontsInDocument('<p><span data-font="inter">hi</span></p>', (editor) =>
        editor.commands.unsetTextFont(),
      ),
    ).toEqual([])
  })
})
