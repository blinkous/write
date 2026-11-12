import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChoiceGroup } from './ChoiceGroup'

const CHOICES = [
  { value: 'one', label: 'One' },
  { value: 'two', label: 'Two' },
] as const

function renderGroup() {
  const onSelect = vi.fn()
  const onChoose = vi.fn()
  render(
    <ChoiceGroup
      label="Numbers"
      choices={CHOICES}
      selectedValue="one"
      onSelect={onSelect}
      onChoose={onChoose}
    />,
  )
  return { onSelect, onChoose }
}

describe('ChoiceGroup', () => {
  it('chooses on click, so a menu can close', async () => {
    const { onSelect, onChoose } = renderGroup()
    await userEvent.setup().click(screen.getByRole('radio', { name: 'Two' }))
    expect(onSelect).toHaveBeenCalledWith('two')
    expect(onChoose).toHaveBeenCalledOnce()
  })

  it('chooses on Enter', () => {
    const { onSelect, onChoose } = renderGroup()
    fireEvent.keyDown(screen.getByRole('radio', { name: 'One' }), {
      key: 'Enter',
    })
    expect(onSelect).toHaveBeenCalledWith('one')
    expect(onChoose).toHaveBeenCalledOnce()
  })

  it('only selects on arrow keys (their clicks have no click count), so menus stay open to preview', () => {
    const { onChoose } = renderGroup()
    fireEvent.click(screen.getByRole('radio', { name: 'Two' }), { detail: 0 })
    expect(onChoose).not.toHaveBeenCalled()
  })
})
