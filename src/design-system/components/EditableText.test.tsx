import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { EditableText } from './EditableText'

/** Holds the value like an app would, reporting each finished edit. */
function EditableTitle({ onEditEnd }: { onEditEnd: (value: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <EditableText
      label="Tab title"
      value={value}
      placeholder="Write"
      onChange={setValue}
      onEditEnd={(finalValue) => {
        setValue(finalValue)
        onEditEnd(finalValue)
      }}
    />
  )
}

function renderTitle() {
  const onEditEnd = vi.fn()
  render(<EditableTitle onEditEnd={onEditEnd} />)
  return { onEditEnd, user: userEvent.setup() }
}

describe('EditableText', () => {
  it('shows the placeholder while empty', () => {
    renderTitle()
    expect(
      screen.getByRole('button', { name: 'Tab title: Write' }),
    ).toHaveTextContent('Write')
  })

  it('edits in place and keeps the text on Enter', async () => {
    const { onEditEnd, user } = renderTitle()
    await user.click(screen.getByRole('button', { name: 'Tab title: Write' }))
    await user.keyboard('Notes{Enter}')
    expect(onEditEnd).toHaveBeenCalledWith('Notes')
    expect(
      screen.getByRole('button', { name: 'Tab title: Notes' }),
    ).toHaveFocus()
  })

  it('keeps the text on leaving the field', async () => {
    const { onEditEnd, user } = renderTitle()
    await user.click(screen.getByRole('button', { name: 'Tab title: Write' }))
    await user.keyboard('Notes')
    await user.tab()
    expect(onEditEnd).toHaveBeenCalledOnce()
    expect(onEditEnd).toHaveBeenCalledWith('Notes')
  })

  it('puts the value back on Escape', async () => {
    const { onEditEnd, user } = renderTitle()
    await user.click(screen.getByRole('button', { name: 'Tab title: Write' }))
    await user.keyboard('Notes{Escape}')
    expect(onEditEnd).toHaveBeenCalledOnce()
    expect(onEditEnd).toHaveBeenCalledWith('')
    expect(
      screen.getByRole('button', { name: 'Tab title: Write' }),
    ).toHaveFocus()
  })
})
