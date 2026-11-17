import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { titleExtensions } from '../../journal-document'
import { DEFAULT_TEXT_STYLES } from '../../text-styles'
import { createTestEditor } from '../../test/createTestEditor'
import { editorExtensions } from './editorExtensions'
import { TextStyleMenu } from './TextStyleMenu'

function renderMenu(isTitle: boolean) {
  const editor = createTestEditor({
    extensions: isTitle ? titleExtensions : editorExtensions,
    content: isTitle ? 'A title' : '<p>Some writing</p>',
  })
  const onChangeTextStyle = vi.fn()
  render(
    <TextStyleMenu
      editor={editor}
      editorFont="lora"
      isTitle={isTitle}
      textStyles={DEFAULT_TEXT_STYLES}
      onChangeTextStyle={onChangeTextStyle}
      onResetTextStyle={vi.fn()}
    />,
  )
  return { editor, onChangeTextStyle }
}

const button = (name: string | RegExp) =>
  screen.getByRole('button', { name, hidden: true })
const queryButton = (name: string | RegExp) =>
  screen.queryByRole('button', { name, hidden: true })

describe('TextStyleMenu', () => {
  it('gives each style row its own options', async () => {
    renderMenu(false)
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: /^Text style: Body/ }))
    for (const label of ['Body', 'Small', 'Heading 2', 'Heading 6'])
      expect(button(`${label} options`)).toBeInTheDocument()
    expect(queryButton('Title options')).not.toBeInTheDocument()
  })

  it('applies a style from its row', async () => {
    const { editor } = renderMenu(false)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /^Text style: Body/ }))
    await user.click(button(/^Heading 2$/))
    expect(editor.isActive('heading', { level: 2 })).toBe(true)
  })

  it('updates a style to match the text from its options', async () => {
    const { onChangeTextStyle } = renderMenu(false)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /^Text style: Body/ }))
    await user.click(button('Heading 3 options'))
    await user.click(button(/Update style to match text/))
    expect(onChangeTextStyle).toHaveBeenCalledWith(
      'heading-3',
      expect.objectContaining({ bold: false, font: null }),
    )
  })

  it('lists just Title in the title, chosen, with its options', async () => {
    renderMenu(true)
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Text style: Title' }))
    expect(button(/^Title$/)).toHaveAttribute('aria-pressed', 'true')
    expect(button('Title options')).toBeInTheDocument()
    expect(queryButton(/^Body/)).not.toBeInTheDocument()
  })
})
