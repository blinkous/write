import { fireEvent, renderHook } from '@testing-library/react'
import { useExportShortcuts } from './useExportShortcuts'

describe('useExportShortcuts', () => {
  it('saves the entry with ⌘S and everything with ⇧⌘S, instead of the browser saving the page', () => {
    const exportEntry = vi.fn()
    const exportAllEntries = vi.fn()
    renderHook(() => useExportShortcuts({ exportEntry, exportAllEntries }))
    const saveEntry = new KeyboardEvent('keydown', {
      code: 'KeyS',
      metaKey: true,
      cancelable: true,
    })
    window.dispatchEvent(saveEntry)
    fireEvent.keyDown(window, { code: 'KeyS', metaKey: true, shiftKey: true })
    expect(saveEntry.defaultPrevented).toBe(true)
    expect(exportEntry).toHaveBeenCalledOnce()
    expect(exportAllEntries).toHaveBeenCalledOnce()
  })

  it('ignores other keys', () => {
    const exportEntry = vi.fn()
    renderHook(() =>
      useExportShortcuts({ exportEntry, exportAllEntries: vi.fn() }),
    )
    fireEvent.keyDown(window, { code: 'KeyS' })
    fireEvent.keyDown(window, { code: 'KeyA', metaKey: true })
    expect(exportEntry).not.toHaveBeenCalled()
  })
})
