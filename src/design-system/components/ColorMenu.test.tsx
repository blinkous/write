import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColorMenu } from './ColorMenu'

function renderColorMenu(
  customColors: (string | null)[],
  allowsTransparency = true,
) {
  const handlers = {
    onSelectSuggestion: vi.fn(),
    onSelectCustom: vi.fn(),
    onCustomColorsChange: vi.fn(),
    onPick: vi.fn(),
    onPickEnd: vi.fn(),
  }
  render(
    <ColorMenu
      label="Foreground"
      trigger="A"
      suggestionsLabel="Suggested colors"
      suggestions={[
        {
          color: '#654321',
          label: 'Suggested color 1',
          isSelected: false,
          onSelect: handlers.onSelectSuggestion,
        },
      ]}
      value="#123456"
      pickerColor="#123456"
      allowsTransparency={allowsTransparency}
      customColors={customColors}
      onCustomColorsChange={handlers.onCustomColorsChange}
      onSelectCustom={handlers.onSelectCustom}
      onPick={handlers.onPick}
      onPickEnd={handlers.onPickEnd}
    />,
  )
  return handlers
}

const button = (name: string) =>
  screen.getByRole('button', { name, hidden: true })

async function openMenu() {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Foreground' }))
  return user
}

describe('ColorMenu', () => {
  const picker = () =>
    screen.queryByRole('group', { name: 'Foreground picker', hidden: true })

  it('picks a suggestion and closes', async () => {
    const { onSelectSuggestion } = renderColorMenu([null])
    const user = await openMenu()
    await user.click(button('Suggested color 1'))
    expect(onSelectSuggestion).toHaveBeenCalledOnce()
    expect(picker()).not.toBeInTheDocument()
  })

  it('stays open while saving into an empty slot', async () => {
    renderColorMenu([null])
    const user = await openMenu()
    await user.click(button('Save the current color as custom color 1'))
    expect(picker()).toBeInTheDocument()
  })

  it('marks the custom slot holding the current color as chosen', async () => {
    renderColorMenu(['#123456', '#abcdef'])
    await openMenu()
    expect(button('Custom color 1')).toHaveAttribute('data-selected', 'true')
    expect(button('Custom color 2')).toHaveAttribute('data-selected', 'false')
  })

  it('saves the current color into an empty slot', async () => {
    const { onCustomColorsChange, onSelectCustom } = renderColorMenu([
      '#abcdef',
      null,
    ])
    const user = await openMenu()
    await user.click(button('Save the current color as custom color 2'))
    expect(onCustomColorsChange).toHaveBeenCalledWith(['#abcdef', '#123456'])
    expect(onSelectCustom).not.toHaveBeenCalled()
  })

  it('empties a filled slot from its ×, without choosing its color', async () => {
    const { onCustomColorsChange, onSelectCustom } = renderColorMenu([
      '#abcdef',
      null,
    ])
    const user = await openMenu()
    await user.click(button('Remove custom color 1'))
    expect(onCustomColorsChange).toHaveBeenCalledWith([null, null])
    expect(onSelectCustom).not.toHaveBeenCalled()
  })

  it('picks a filled custom color', async () => {
    const { onSelectCustom } = renderColorMenu(['#abcdef', '#fedcba80'])
    const user = await openMenu()
    await user.click(button('Custom color 2'))
    expect(onSelectCustom).toHaveBeenCalledWith('#fedcba80')
    expect(picker()).not.toBeInTheDocument()
  })

  it('uses a see-through custom color opaque where transparency is off', async () => {
    const { onSelectCustom } = renderColorMenu(['#fedcba80'], false)
    const user = await openMenu()
    await user.click(button('Custom color 1'))
    expect(onSelectCustom).toHaveBeenCalledWith('#fedcba')
  })

  it('has no × on empty slots', async () => {
    renderColorMenu([null])
    await openMenu()
    expect(
      screen.queryByRole('button', { name: /^Remove/, hidden: true }),
    ).toBeNull()
  })

  it('shows an opacity slider only where transparency is allowed', async () => {
    renderColorMenu([null], false)
    await openMenu()
    expect(
      screen.queryByRole('slider', { name: 'Alpha', hidden: true }),
    ).toBeNull()
    expect(
      screen.getByRole('slider', { name: 'Hue', hidden: true }),
    ).toBeInTheDocument()
  })
})
