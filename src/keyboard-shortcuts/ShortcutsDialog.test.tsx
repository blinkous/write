import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getShortcut, resetAllShortcuts } from './shortcutStore'
import { areShortcutsShown, resetShortcutsShown } from './shortcutVisibility'
import { ShortcutsDialog } from './ShortcutsDialog'

afterEach(() => {
  resetAllShortcuts()
  resetShortcutsShown()
})

function renderDialog() {
  render(<ShortcutsDialog isOpen onClose={() => {}} />)
}

// jsdom isn't an Apple device, so Mod is Ctrl.
describe('ShortcutsDialog', () => {
  it('records a new shortcut, and says where it moved from', async () => {
    renderDialog()
    await userEvent.click(
      screen.getByRole('button', { name: 'Underline shortcut: Ctrl+U' }),
    )
    const recorder = screen.getByRole('button', {
      name: 'Underline shortcut: press keys…',
    })
    fireEvent.keyDown(recorder, { key: 'Control', ctrlKey: true })
    fireEvent.keyDown(recorder, { key: 'b', keyCode: 66, ctrlKey: true })
    expect(getShortcut('underline')).toBe('Mod-b')
    expect(getShortcut('bold')).toBeNull()
    expect(
      screen.getByText('Ctrl+B moved from Bold, which has none now.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Bold shortcut: None' }),
    ).toBeInTheDocument()
  })

  it('refuses a shortcut typing would set off, and keeps listening', async () => {
    renderDialog()
    await userEvent.click(
      screen.getByRole('button', { name: 'Bold shortcut: Ctrl+B' }),
    )
    const recorder = screen.getByRole('button', {
      name: 'Bold shortcut: press keys…',
    })
    fireEvent.keyDown(recorder, { key: 'k', keyCode: 75 })
    expect(
      screen.getByText('K would go off while typing. Add Ctrl.'),
    ).toBeInTheDocument()
    fireEvent.keyDown(recorder, { key: 'Escape' })
    expect(getShortcut('bold')).toBe('Mod-b')
  })

  it('removes a shortcut with Backspace, and resets it', async () => {
    renderDialog()
    await userEvent.click(
      screen.getByRole('button', { name: 'Bold shortcut: Ctrl+B' }),
    )
    fireEvent.keyDown(
      screen.getByRole('button', { name: 'Bold shortcut: press keys…' }),
      { key: 'Backspace' },
    )
    expect(getShortcut('bold')).toBeNull()
    await userEvent.click(
      screen.getByRole('button', { name: 'Reset Bold shortcut to Ctrl+B' }),
    )
    expect(getShortcut('bold')).toBe('Mod-b')
  })

  it('listens for keys even where a click doesn’t focus the button (WebKit)', () => {
    renderDialog()
    // fireEvent.click doesn't move focus, as in Safari and DuckDuckGo.
    fireEvent.click(
      screen.getByRole('button', { name: 'Bold shortcut: Ctrl+B' }),
    )
    const focused = document.activeElement
    if (!focused) throw new Error('Nothing focused')
    fireEvent.keyDown(focused, { key: 'k', keyCode: 75, ctrlKey: true })
    expect(getShortcut('bold')).toBe('Mod-k')
  })

  it('lets Tab, Shift+Tab and Option+Tab move on while listening', () => {
    renderDialog()
    for (const tab of [
      { key: 'Tab' },
      { key: 'Tab', shiftKey: true },
      { key: 'Tab', altKey: true },
    ]) {
      const button = screen.getByRole('button', {
        name: 'Bold shortcut: Ctrl+B',
      })
      fireEvent.click(button)
      const isLeftAlone = fireEvent.keyDown(button, tab)
      expect(isLeftAlone).toBe(true)
      expect(button).toHaveAccessibleName('Bold shortcut: Ctrl+B')
    }
    expect(getShortcut('bold')).toBe('Mod-b')
  })

  it('asks before resetting every shortcut', async () => {
    renderDialog()
    await userEvent.click(
      screen.getByRole('button', { name: 'Bold shortcut: Ctrl+B' }),
    )
    fireEvent.keyDown(
      screen.getByRole('button', { name: 'Bold shortcut: press keys…' }),
      { key: 'Backspace' },
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Reset shortcuts' }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(getShortcut('bold')).toBeNull()
    await userEvent.click(
      screen.getByRole('button', { name: 'Reset shortcuts' }),
    )
    await userEvent.click(
      screen.getAllByRole('button', { name: 'Reset shortcuts' }).at(-1) ??
        document.body,
    )
    expect(getShortcut('bold')).toBe('Mod-b')
  })

  it('removes a shortcut with its ×', async () => {
    renderDialog()
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Italic shortcut' }),
    )
    expect(getShortcut('italic')).toBeNull()
    expect(
      screen.getByRole('button', { name: 'Remove Italic shortcut' }),
    ).toBeDisabled()
  })

  it('hides shortcuts in menus and tooltips when switched off', async () => {
    renderDialog()
    const showShortcuts = screen.getByRole('switch', {
      name: 'Show shortcuts in menus and tooltips',
    })
    // jsdom can't tell what the device has, so shortcuts show by default.
    expect(showShortcuts).toBeChecked()
    await userEvent.click(showShortcuts)
    expect(areShortcutsShown()).toBe(false)
  })
})
