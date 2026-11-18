import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColorPicker } from './ColorPicker'

function renderPicker() {
  const onChange = vi.fn()
  const onChangeEnd = vi.fn()
  render(
    <ColorPicker
      label="Text color"
      color="#123456"
      allowsTransparency
      onChange={onChange}
      onChangeEnd={onChangeEnd}
    />,
  )
  const field = screen.getByRole('textbox', { name: 'Text color value' })
  return { onChange, onChangeEnd, field }
}

describe('ColorPicker', () => {
  it('applies a typed color as one finished pick', async () => {
    const { onChange, onChangeEnd, field } = renderPicker()
    const user = userEvent.setup()
    await user.clear(field)
    await user.type(field, 'rgb(255 0 0 / 50%){Enter}')
    expect(onChange).toHaveBeenCalledWith('#ff000080')
    expect(onChangeEnd).toHaveBeenCalledOnce()
  })

  it('puts back the current color when the typed text is not a color', async () => {
    const { onChange, field } = renderPicker()
    const user = userEvent.setup()
    await user.clear(field)
    await user.type(field, 'nope')
    await user.tab()
    expect(onChange).not.toHaveBeenCalled()
    expect(field).toHaveValue('#123456')
  })

  it('offers the system color picker as the dropper where the screen dropper is missing', () => {
    renderPicker()
    expect(
      screen.getByRole('button', { name: 'Open the system color picker' }),
    ).toBeInTheDocument()
  })

  it('picks straight from the screen where the browser has a dropper, keeping transparency', async () => {
    class FakeEyeDropper {
      open = async () => ({ sRGBHex: '#abcdef' })
    }
    window.EyeDropper = FakeEyeDropper
    try {
      const onChange = vi.fn()
      render(
        <ColorPicker
          label="Text color"
          color="#12345680"
          allowsTransparency
          onChange={onChange}
        />,
      )
      await userEvent
        .setup()
        .click(
          screen.getByRole('button', { name: 'Pick a color from the screen' }),
        )
      expect(onChange).toHaveBeenCalledWith('#abcdef80')
    } finally {
      delete window.EyeDropper
    }
  })
})
