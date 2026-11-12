import type { Editor } from '@tiptap/react'
import { useEffect, useState } from 'react'

/**
 * The editor the toolbar acts on: whichever of the two was focused last (e.g.
 * the writing or the title), so focus moving to the toolbar doesn't change
 * it. Starts as the main one.
 */
export function useActiveEditor(
  mainEditor: Editor,
  otherEditor: Editor,
): Editor {
  const [lastFocused, setLastFocused] = useState<Editor | null>(null)

  useEffect(() => {
    const focusMain = () => setLastFocused(mainEditor)
    const focusOther = () => setLastFocused(otherEditor)
    mainEditor.on('focus', focusMain)
    otherEditor.on('focus', focusOther)
    return () => {
      mainEditor.off('focus', focusMain)
      otherEditor.off('focus', focusOther)
    }
  }, [mainEditor, otherEditor])

  // A replaced or destroyed editor (another entry opened) falls back to the main one.
  return lastFocused === otherEditor && !otherEditor.isDestroyed
    ? otherEditor
    : mainEditor
}
