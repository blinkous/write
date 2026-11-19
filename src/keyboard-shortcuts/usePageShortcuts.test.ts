import { fireEvent, renderHook } from '@testing-library/react'
import { assignShortcut, resetAllShortcuts } from './shortcutStore'
import { usePageShortcuts } from './usePageShortcuts'

function renderPageShortcuts() {
  const actions = {
    'copy-selection-markdown': vi.fn(),
    'copy-entry-markdown': vi.fn(),
    'export-entry': vi.fn(),
    'open-export': vi.fn(),
    'open-import': vi.fn(),
  }
  renderHook(() => usePageShortcuts(actions))
  return actions
}

afterEach(resetAllShortcuts)

// jsdom isn't an Apple device, so Mod is Ctrl.
describe('usePageShortcuts', () => {
  it('runs actions on their shortcuts instead of the browser’s', () => {
    const actions = renderPageShortcuts()
    const saveEntry = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      cancelable: true,
    })
    window.dispatchEvent(saveEntry)
    fireEvent.keyDown(window, { key: 'S', ctrlKey: true, shiftKey: true })
    fireEvent.keyDown(window, { key: 'o', ctrlKey: true })
    fireEvent.keyDown(window, {
      key: 'C',
      ctrlKey: true,
      altKey: true,
      shiftKey: true,
    })
    expect(saveEntry.defaultPrevented).toBe(true)
    expect(actions['export-entry']).toHaveBeenCalledOnce()
    expect(actions['open-export']).toHaveBeenCalledOnce()
    expect(actions['open-import']).toHaveBeenCalledOnce()
    expect(actions['copy-selection-markdown']).toHaveBeenCalledOnce()
    expect(actions['copy-entry-markdown']).not.toHaveBeenCalled()
  })

  it('follows changed shortcuts', () => {
    assignShortcut('open-import', 'Mod-j')
    const actions = renderPageShortcuts()
    fireEvent.keyDown(window, { key: 'o', ctrlKey: true })
    fireEvent.keyDown(window, { key: 'j', ctrlKey: true })
    expect(actions['open-import']).toHaveBeenCalledOnce()
  })

  it('ignores plain keys and keys the editor already handled', () => {
    const actions = renderPageShortcuts()
    fireEvent.keyDown(window, { key: 's' })
    const handled = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      cancelable: true,
    })
    handled.preventDefault()
    window.dispatchEvent(handled)
    expect(actions['export-entry']).not.toHaveBeenCalled()
  })
})
