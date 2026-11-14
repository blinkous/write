import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SwatchColorInput } from './Swatch'

function renderSlot(value: string | null = '#aa3366') {
  const onClick = vi.fn()
  const onClear = vi.fn()
  const openedPickers: HTMLInputElement[] = []
  const { container } = render(
    <SwatchColorInput
      value={value}
      label="Custom color 1"
      onClick={onClick}
      onChange={vi.fn()}
      onClear={onClear}
    />,
  )
  const colorInput = container.querySelector('input[type=color]')
  if (!(colorInput instanceof HTMLInputElement)) throw new Error('no input')
  // jsdom has no picker; opening one falls back to a click on the input.
  colorInput.addEventListener('click', () => openedPickers.push(colorInput))
  return { onClick, onClear, colorInput, openedPickers }
}

describe('SwatchColorInput', () => {
  it('is a button the keyboard reaches, not the hidden color input', async () => {
    const { colorInput } = renderSlot()
    await userEvent.setup().tab()
    expect(screen.getByRole('button', { name: 'Custom color 1' })).toHaveFocus()
    expect(colorInput).toHaveAttribute('tabindex', '-1')
  })

  it('opens the color picker when pressed, after its own click handler', async () => {
    const { onClick, openedPickers } = renderSlot()
    screen.getByRole('button', { name: 'Custom color 1' }).focus()
    await userEvent.setup().keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledOnce()
    expect(openedPickers).toHaveLength(1)
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
