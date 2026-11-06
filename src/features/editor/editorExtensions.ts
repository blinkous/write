import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from '@tiptap/markdown'
import { documentExtensions } from '../../journal-document'
import { MoveBlocks } from './moveBlocks'
import { TabIndent } from './tabIndent'

/** The document schema plus editing behaviour. Shared by the editor UI and tests. */
export const editorExtensions = [
  ...documentExtensions,
  Markdown,
  MoveBlocks,
  TabIndent,
  Placeholder.configure({ placeholder: 'Start writing…' }),
]
