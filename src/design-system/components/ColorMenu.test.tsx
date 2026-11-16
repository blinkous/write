import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColorMenu } from './ColorMenu'

function renderColorMenu(customColors: (string | null)[]) {
  const handlers = {
    onSelectSuggestion: vi.fn(),
    onSelectCustom: vi.fn(),
    onCustomColorsChange: vi.fn(),
  }
  render(
    <ColorMenu
      label="Foreground"
      trigger="A"
      suggestionsLabel="Suggested colors"
      suggestions={[
        {
          color: '#654321',
          label: 'Match the background',
          isSelected: false,
          onSelect: handlers.onSelectSuggestion,
        },
      ]}
      value="#123456"
      customColors={customColors}
      onCustomColorsChange={handlers.onCustomColorsChange}
      emptyPickerColor="#123456"
      onSelectCustom={handlers.onSelectCustom}
      onPick={vi.fn()}
    />,
  )
  return handlers
}

const button = (name: string) =>
  screen.getByRole('button', { name, hidden: true })

describe('ColorMenu', () => {
  it('opens from a tile and picks a suggestion', async () => {
    const user = userEvent.setup()
    const { onSelectSuggestion } = renderColorMenu([null])
    await user.click(screen.getByRole('button', { name: 'Foreground' }))
    await user.click(button('Match the background'))
    expect(onSelectSuggestion).toHaveBeenCalledOnce()
  })

  it('marks the custom slot holding the current color as chosen', async () => {
    const user = userEvent.setup()
    renderColorMenu(['#123456', '#abcdef'])
    await user.click(screen.getByRole('button', { name: 'Foreground' }))
    expect(button('Custom color 1')).toHaveAttribute('data-selected', 'true')
    expect(button('Custom color 2')).toHaveAttribute('data-selected', 'false')
  })

  it('empties a filled slot from its ×, without choosing its color', async () => {
    const user = userEvent.setup()
    const { onCustomColorsChange, onSelectCustom } = renderColorMenu([
      '#abcdef',
      null,
    ])
    await user.click(screen.getByRole('button', { name: 'Foreground' }))
    await user.click(button('Remove custom color 1'))
    expect(onCustomColorsChange).toHaveBeenCalledWith([null, null])
    expect(onSelectCustom).not.toHaveBeenCalled()
  })

  it('picks a filled custom color', async () => {
    const user = userEvent.setup()
    const { onSelectCustom } = renderColorMenu(['#abcdef', '#fedcba'])
    await user.click(screen.getByRole('button', { name: 'Foreground' }))
    await user.click(button('Custom color 2'))
    expect(onSelectCustom).toHaveBeenCalledWith('#fedcba')
  })

  it('has no × on empty slots', async () => {
    const user = userEvent.setup()
    renderColorMenu([null])
    await user.click(screen.getByRole('button', { name: 'Foreground' }))
    expect(
      screen.queryByRole('button', { name: /^Remove/, hidden: true }),
    ).toBeNull()
  })
})
