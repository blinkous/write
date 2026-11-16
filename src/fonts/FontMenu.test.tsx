import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FontMenu } from './FontMenu'

describe('FontMenu', () => {
  it('offers Default first when given a default font, and picks it as null', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <FontMenu
        label="Text font"
        value="inter"
        defaultFont="lora"
        onChange={onChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Text font: Inter' }))
    const [first] = screen.getAllByRole('radio', { hidden: true })
    expect(first).toHaveAccessibleName('Default (Lora)')
    await user.click(first)
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('shows the default font on the trigger when nothing is chosen', () => {
    render(
      <FontMenu
        label="Text font"
        value={null}
        defaultFont="lora"
        onChange={() => {}}
      />,
    )
    expect(
      screen.getByRole('button', { name: 'Text font: Default (Lora)' }),
    ).toBeInTheDocument()
  })

  it('captions the default font under Default on the trigger', () => {
    render(
      <FontMenu
        label="Text font"
        value={null}
        defaultFont="lora"
        onChange={() => {}}
      />,
    )
    expect(
      screen.getByRole('button', { name: /^Text font/ }),
    ).toHaveTextContent(/^DefaultLora$/)
  })

  it('has no Default option without a default font', async () => {
    const user = userEvent.setup()
    render(<FontMenu label="Page font" value="lora" onChange={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'Page font: Lora' }))
    expect(
      screen.queryByRole('radio', { name: /^Default/, hidden: true }),
    ).toBeNull()
  })
})
