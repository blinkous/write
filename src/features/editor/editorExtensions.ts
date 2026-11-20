import type { AnyExtension } from '@tiptap/core'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from '@tiptap/markdown'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { documentExtensions, IMAGE_NODE_NAME } from '../../journal-document'
import { withoutCommandShortcuts } from '../../keyboard-shortcuts'
import { EditorShortcuts, WRITING_SHORTCUT_COMMANDS } from './editorShortcuts'
import { ImageInsertion } from './imageInsertion'
import { ImageView } from './ImageView'
import { MoveBlocks } from './moveBlocks'
import { TabIndent } from './tabIndent'

/* Pictures shown with their ⋯ (see ImageView). */
function withImageView(extension: AnyExtension): AnyExtension {
  if (extension.name !== IMAGE_NODE_NAME) return extension
  return extension.extend({
    addNodeView: () => ReactNodeViewRenderer(ImageView),
  })
}

type EditorExtensionOptions = {
  /** Says why a picture wasn't added (see ImageInsertion). */
  onImageProblem?: (problem: string) => void
}

/** The document schema plus editing behaviour. Shared by the editor UI and tests. */
export function createEditorExtensions({
  onImageProblem,
}: EditorExtensionOptions = {}): AnyExtension[] {
  return [
    ...withoutCommandShortcuts(documentExtensions.map(withImageView)),
    Markdown,
    MoveBlocks,
    TabIndent,
    ImageInsertion.configure(onImageProblem && { onProblem: onImageProblem }),
    EditorShortcuts.configure({ commands: WRITING_SHORTCUT_COMMANDS }),
    Placeholder.configure({ placeholder: 'Start writing…' }),
  ]
}

export const editorExtensions = createEditorExtensions()
