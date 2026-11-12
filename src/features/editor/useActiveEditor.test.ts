import { act, renderHook } from '@testing-library/react'
import { titleExtensions } from '../../journal-document'
import { createTestEditor } from '../../test/createTestEditor'
import { useActiveEditor } from './useActiveEditor'

describe('useActiveEditor', () => {
  it('follows focus, and falls back to the main editor once the other is destroyed', () => {
    const mainEditor = createTestEditor({ extensions: titleExtensions })
    const otherEditor = createTestEditor({ extensions: titleExtensions })
    const { result, rerender } = renderHook(() =>
      useActiveEditor(mainEditor, otherEditor),
    )
    expect(result.current).toBe(mainEditor)
    act(() => {
      otherEditor.emit('focus', {
        editor: otherEditor,
        event: new FocusEvent('focus'),
        transaction: otherEditor.state.tr,
      })
    })
    expect(result.current).toBe(otherEditor)
    otherEditor.destroy()
    rerender()
    expect(result.current).toBe(mainEditor)
  })
})
