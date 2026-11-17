import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { titleExtensions } from '../../journal-document'
import { createTestEditor } from '../../test/createTestEditor'
import { editorExtensions } from './editorExtensions'
import { TextStyleMenu } from './TextStyleMenu'

function renderMenu(isTitle: boolean) {
  const editor = createTestEditor({
    extensions: isTitle ? titleExtensions : editorExtensions,
    content: isTitle ? 'A title' : '<p>Some writing</p>',
  })
  render(
    <TextStyleMenu
      editor={editor}
      isTitle={isTitle}
      renderStyleEdit={(name) => <button type="button">Edit {name}</button>}
    />,
  )
  return editor
}

const button = (name: string | RegExp) =>
  screen.getByRole('button', { name, hidden: true })
const queryButton = (name: string | RegExp) =>
  screen.queryByRole('button', { name, hidden: true })

describe('TextStyleMenu', () => {
  it('gives each style row its own edit control', async () => {
    renderMenu(false)
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: /^Text style: Body/ }))
    for (const name of ['body', 'small', 'heading-2', 'heading-6'])
      expect(button(`Edit ${name}`)).toBeInTheDocument()
    expect(queryButton('Edit title')).not.toBeInTheDocument()
  })

  it('applies a style from its row', async () => {
    const editor = renderMenu(false)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /^Text style: Body/ }))
    await user.click(button(/^Heading 2/))
    expect(editor.isActive('heading', { level: 2 })).toBe(true)
  })

  it('lists just Title in the title, chosen, to edit it', async () => {
    renderMenu(true)
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Text style: Title' }))
    expect(button(/^Title/)).toHaveAttribute('aria-pressed', 'true')
    expect(button('Edit title')).toBeInTheDocument()
    expect(queryButton(/^Body/)).not.toBeInTheDocument()
  })
})
