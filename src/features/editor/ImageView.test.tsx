import { EditorContent, useEditor } from '@tiptap/react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { storeImage } from '../../journal-images'
import { resetIndexedDb } from '../../test/resetIndexedDb'
import { createEditorExtensions } from './editorExtensions'

function Writing({ html }: { html: string }) {
  const editor = useEditor({
    extensions: createEditorExtensions(),
    content: html,
    injectCSS: false,
  })
  return <EditorContent editor={editor} />
}

async function storedGif() {
  const stored = await storeImage(
    new File(['cat'], 'cat.gif', { type: 'image/gif' }),
  )
  if (!stored.ok) throw new Error(stored.problem)
  return stored.imageId
}

describe('pictures in the writing', () => {
  beforeEach(() => {
    resetIndexedDb()
    URL.createObjectURL = vi.fn(() => 'blob:picture')
    URL.revokeObjectURL = vi.fn()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('shows a stored picture, described by its alt text', async () => {
    const imageId = await storedGif()
    render(<Writing html={`<img data-image-id="${imageId}" alt="A cat">`} />)
    expect(await screen.findByRole('img', { name: 'A cat' })).toHaveAttribute(
      'src',
      'blob:picture',
    )
  })

  it('shows a picture that isn’t on this device as not found', async () => {
    const imageId = `${'a'.repeat(64)}.png`
    render(<Writing html={`<img data-image-id="${imageId}" alt="A cat">`} />)
    expect(
      await screen.findByRole('img', { name: 'A cat (picture not found)' }),
    ).toBeInTheDocument()
  })

  it('changes the alt text from its ⋯', async () => {
    const user = userEvent.setup()
    const imageId = await storedGif()
    render(<Writing html={`<img data-image-id="${imageId}" alt="">`} />)
    await user.click(
      await screen.findByRole('button', { name: 'Picture options' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Alt text', hidden: true }),
    )
    await user.type(
      screen.getByRole('textbox', {
        name: 'Describe the picture',
        hidden: true,
      }),
      'A sleepy cat{Enter}',
    )
    await waitFor(() =>
      expect(screen.getByRole('img', { name: 'A sleepy cat' })).toBeVisible(),
    )
  })

  it('pauses and plays a GIF from its ⋯', async () => {
    const user = userEvent.setup()
    const imageId = await storedGif()
    render(<Writing html={`<img data-image-id="${imageId}" alt="A cat">`} />)
    const options = await screen.findByRole('button', {
      name: 'Picture options',
    })
    await user.click(options)
    await user.click(
      screen.getByRole('button', { name: 'Pause GIF', hidden: true }),
    )
    const still = await screen.findByRole('img', { name: 'A cat' })
    expect(still.tagName).toBe('CANVAS')
    await user.click(options)
    await user.click(
      screen.getByRole('button', { name: 'Play GIF', hidden: true }),
    )
    expect((await screen.findByRole('img', { name: 'A cat' })).tagName).toBe(
      'IMG',
    )
  })

  it('holds a GIF still when the system asks for less motion', async () => {
    vi.stubGlobal(
      'matchMedia',
      (query: string) =>
        ({ matches: query.includes('reduce') }) as MediaQueryList,
    )
    const imageId = await storedGif()
    render(<Writing html={`<img data-image-id="${imageId}" alt="A cat">`} />)
    expect((await screen.findByRole('img', { name: 'A cat' })).tagName).toBe(
      'CANVAS',
    )
  })
})
