import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Switch } from './Switch'

describe('Switch', () => {
  it('is announced as a switch named by its label, and flips from its name or the keyboard', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Switch label="Sidebar border" checked={false} onChange={onChange} />,
    )
    const sidebarBorder = screen.getByRole('switch', { name: 'Sidebar border' })
    expect(sidebarBorder).not.toBeChecked()

    await user.click(screen.getByText('Sidebar border'))
    expect(onChange).toHaveBeenCalledTimes(1)

    sidebarBorder.focus()
    await user.keyboard(' ')
    expect(onChange).toHaveBeenCalledTimes(2)
  })
})
