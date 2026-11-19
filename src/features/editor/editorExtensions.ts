import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from '@tiptap/markdown'
import { documentExtensions } from '../../journal-document'
import { withoutCommandShortcuts } from '../../keyboard-shortcuts'
import { EditorShortcuts, WRITING_SHORTCUT_COMMANDS } from './editorShortcuts'
import { MoveBlocks } from './moveBlocks'
import { TabIndent } from './tabIndent'

/** The document schema plus editing behaviour. Shared by the editor UI and tests. */
export const editorExtensions = [
  ...withoutCommandShortcuts(documentExtensions),
  Markdown,
  MoveBlocks,
  TabIndent,
  EditorShortcuts.configure({ commands: WRITING_SHORTCUT_COMMANDS }),
  Placeholder.configure({ placeholder: 'Start writing…' }),
]
