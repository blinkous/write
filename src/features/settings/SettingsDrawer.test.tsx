import { fireEvent, render, screen } from '@testing-library/react'
import { SettingsDrawer } from './SettingsDrawer'

/* Tests run as a non-Apple platform, so undo is Ctrl+Z. */
function renderDrawer() {
  const onUndo = vi.fn()
  const onRedo = vi.fn()
  render(
    <SettingsDrawer
      onUndo={onUndo}
      onRedo={onRedo}
      sections={[
        {
          id: 'theme',
          title: 'Theme',
          isOpenByDefault: true,
          content: (
            <>
              <button type="button">Pack</button>
              <input aria-label="Tab title" />
            </>
          ),
        },
      ]}
    />,
  )
  return { onUndo, onRedo }
}

describe('SettingsDrawer undo keys', () => {
  beforeEach(() => localStorage.clear())

  it('undoes and redoes settings from a control in the drawer', () => {
    const { onUndo, onRedo } = renderDrawer()
    const pack = screen.getByRole('button', { name: 'Pack' })
    fireEvent.keyDown(pack, { key: 'z', ctrlKey: true })
    expect(onUndo).toHaveBeenCalledOnce()
    fireEvent.keyDown(pack, { key: 'Z', ctrlKey: true, shiftKey: true })
    expect(onRedo).toHaveBeenCalledOnce()
  })

  it('works with focus on the drawer itself (a click WebKit doesn’t focus)', () => {
    const { onUndo } = renderDrawer()
    const drawer = screen.getByRole('region', { name: 'Settings' })
    const settings = drawer.parentElement
    if (!settings) throw new Error('No settings panel')
    fireEvent.keyDown(settings, { key: 'z', ctrlKey: true })
    expect(onUndo).toHaveBeenCalledOnce()
  })

  it('leaves text fields their own undo', () => {
    const { onUndo } = renderDrawer()
    const field = screen.getByRole('textbox', { name: 'Tab title' })
    expect(fireEvent.keyDown(field, { key: 'z', ctrlKey: true })).toBe(true)
    expect(onUndo).not.toHaveBeenCalled()
  })
})
