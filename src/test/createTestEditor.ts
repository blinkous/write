import { Editor, type EditorOptions } from '@tiptap/core'

const openEditors = new Set<Editor>()

/*
 * Tiptap schedules timers after creating an editor; an editor left open can
 * fire them after its test file's DOM is torn down, causing stray errors.
 */
afterEach(() => {
  for (const editor of openEditors) editor.destroy()
  openEditors.clear()
})

/** Creates an editor for a test and destroys it automatically after the test. */
export function createTestEditor(options: Partial<EditorOptions>): Editor {
  const editor = new Editor(options)
  openEditors.add(editor)
  return editor
}
