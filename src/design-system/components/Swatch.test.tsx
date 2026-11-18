import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SwatchSlot } from './Swatch'

function renderSlot(value: string | null = '#aa3366') {
  const onClick = vi.fn()
  const onClear = vi.fn()
  render(
    <SwatchSlot
      value={value}
      label="Custom color 1"
      isSelected={false}
      onClick={onClick}
      onClear={onClear}
    />,
  )
  return { onClick, onClear }
}

describe('SwatchSlot', () => {
  it('is pressed from the keyboard', async () => {
    const { onClick } = renderSlot()
    const user = userEvent.setup()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Custom color 1' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('keeps focus on the tile after clearing it', async () => {
    const { onClear } = renderSlot()
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Remove custom color 1' }))
    expect(onClear).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Custom color 1' })).toHaveFocus()
  })
})
