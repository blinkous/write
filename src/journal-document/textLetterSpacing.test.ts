import { createTestEditor } from '../test/createTestEditor'
import { documentExtensions } from './documentExtensions'
import { resolveTextLetterSpacing } from './textLetterSpacing'

describe('resolveTextLetterSpacing', () => {
  it('turns a whole percent in range into em, so it scales with the text', () => {
    expect(resolveTextLetterSpacing(12)).toBe('0.12em')
    expect(resolveTextLetterSpacing(-5)).toBe('-0.05em')
  })

  it('ignores anything else, e.g. from an imported file', () => {
    expect(resolveTextLetterSpacing(31)).toBeNull()
    expect(resolveTextLetterSpacing(2.5)).toBeNull()
    expect(resolveTextLetterSpacing('10')).toBeNull()
    expect(resolveTextLetterSpacing(null)).toBeNull()
  })
})

describe('text letter spacing commands', () => {
  const spacingsInDocument = (
    html: string,
    run: (editor: ReturnType<typeof createTestEditor>) => void,
  ) => {
    const editor = createTestEditor({
      extensions: documentExtensions,
      content: html,
    })
    editor.commands.selectAll()
    run(editor)
    return editor.getHTML().match(/data-letter-spacing="[^"]*"/g) ?? []
  }

  it('sets a spacing and keeps it when pasted back in', () => {
    expect(
      spacingsInDocument('<p>hi</p>', (editor) =>
        editor.commands.setTextLetterSpacing(20),
      ),
    ).toEqual(['data-letter-spacing="20"'])
    expect(
      spacingsInDocument(
        '<p><span data-letter-spacing="-3">hi</span></p>',
        () => {},
      ),
    ).toEqual(['data-letter-spacing="-3"'])
  })

  it('drops spacings out of range and unsets back to the style', () => {
    expect(
      spacingsInDocument(
        '<p><span data-letter-spacing="999">hi</span></p>',
        () => {},
      ),
    ).toEqual([])
    expect(
      spacingsInDocument(
        '<p><span data-letter-spacing="10">hi</span></p>',
        (editor) => editor.commands.unsetTextLetterSpacing(),
      ),
    ).toEqual([])
  })
})
