import { createTestEditor } from '../../test/createTestEditor'
import { resetIndexedDb } from '../../test/resetIndexedDb'
import { createEditorExtensions } from './editorExtensions'
import { insertImageFiles } from './imageInsertion'

const gif = (content: string) =>
  new File([content], 'cat.gif', { type: 'image/gif' })

function writingWith(text: string) {
  return createTestEditor({
    extensions: createEditorExtensions(),
    content: `<p>${text}</p>`,
  })
}

const blockTypes = (editor: ReturnType<typeof writingWith>) =>
  (editor.getJSON().content ?? []).map(({ type }) => type)

describe('inserting pictures', () => {
  beforeEach(() => resetIndexedDb())

  it('keeps each file and adds it, in order, where the cursor is', async () => {
    const editor = writingWith('hello')
    editor.commands.setTextSelection(6)
    const onProblem = vi.fn()
    await insertImageFiles(editor, [gif('one'), gif('two')], onProblem)
    expect(onProblem).not.toHaveBeenCalled()
    const images = (editor.getJSON().content ?? []).filter(
      ({ type }) => type === 'image',
    )
    expect(images).toHaveLength(2)
    expect(images[0].attrs).toEqual({
      imageId: expect.stringMatching(/^[0-9a-f]{64}\.gif$/),
      alt: '',
      playback: null,
      alignment: null,
    })
    expect(images[0].attrs?.imageId).not.toBe(images[1].attrs?.imageId)
    expect(blockTypes(editor)[0]).toBe('paragraph')
  })

  it('adds what it can and says why the rest were left out', async () => {
    const editor = writingWith('hello')
    const onProblem = vi.fn()
    const notes = new File(['hi'], 'notes.txt', { type: 'text/plain' })
    await insertImageFiles(editor, [notes, gif('cat')], onProblem)
    expect(onProblem).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining('“notes.txt” isn’t a picture'),
    )
    expect(blockTypes(editor)).toContain('image')
  })

  it('adds nothing when no file can go in', async () => {
    const editor = writingWith('hello')
    const notes = new File(['hi'], 'notes.txt', { type: 'text/plain' })
    await insertImageFiles(editor, [notes], vi.fn())
    expect(blockTypes(editor)).toEqual(['paragraph'])
  })
})
