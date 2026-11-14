import { fireEvent, renderHook } from '@testing-library/react'
import { useFileShortcuts } from './useFileShortcuts'

function renderFileShortcuts() {
  const actions = {
    exportEntry: vi.fn(),
    openExport: vi.fn(),
    openImport: vi.fn(),
  }
  renderHook(() => useFileShortcuts(actions))
  return actions
}

describe('useFileShortcuts', () => {
  it('saves the entry with ⌘S and everything with ⇧⌘S, instead of the browser saving the page', () => {
    const { exportEntry, openExport } = renderFileShortcuts()
    const saveEntry = new KeyboardEvent('keydown', {
      code: 'KeyS',
      metaKey: true,
      cancelable: true,
    })
    window.dispatchEvent(saveEntry)
    fireEvent.keyDown(window, { code: 'KeyS', metaKey: true, shiftKey: true })
    expect(saveEntry.defaultPrevented).toBe(true)
    expect(exportEntry).toHaveBeenCalledOnce()
    expect(openExport).toHaveBeenCalledOnce()
  })

  it('opens Import with ⌘O, instead of the browser opening a file', () => {
    const { openImport } = renderFileShortcuts()
    const openFile = new KeyboardEvent('keydown', {
      code: 'KeyO',
      ctrlKey: true,
      cancelable: true,
    })
    window.dispatchEvent(openFile)
    expect(openFile.defaultPrevented).toBe(true)
    expect(openImport).toHaveBeenCalledOnce()
  })

  it('ignores other keys', () => {
    const actions = renderFileShortcuts()
    fireEvent.keyDown(window, { code: 'KeyS' })
    fireEvent.keyDown(window, { code: 'KeyO' })
    fireEvent.keyDown(window, { code: 'KeyA', metaKey: true })
    fireEvent.keyDown(window, { code: 'KeyO', metaKey: true, altKey: true })
    for (const action of Object.values(actions))
      expect(action).not.toHaveBeenCalled()
  })
})
