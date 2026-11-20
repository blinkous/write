import { Extension, type Editor, type JSONContent } from '@tiptap/core'
import { FileHandlePlugin } from '@tiptap/extension-file-handler'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { IMAGE_NODE_NAME } from '../../journal-document'
import { IMAGE_ACCEPT, storeImage } from '../../journal-images'
import { chooseFiles } from '../../lib/chooseFiles'

type ImageInsertionOptions = {
  /** Says why a file wasn't added (too big, not a picture, storage full). */
  onProblem: (problem: string) => void
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageInsertion: {
      /** Opens the file picker; the pictures chosen go where the cursor is. */
      chooseImages: () => ReturnType
    }
  }
}

/**
 * Keeps each file and adds it as a picture, in order, at `position` (a drop)
 * or the selection. Files that can't be kept are left out, and the first
 * problem is reported.
 */
export async function insertImageFiles(
  editor: Editor,
  files: readonly File[],
  onProblem: (problem: string) => void,
  position?: number,
): Promise<void> {
  const results = await Promise.all(files.map((file) => storeImage(file)))
  const images: JSONContent[] = results.flatMap((result) =>
    result.ok
      ? [{ type: IMAGE_NODE_NAME, attrs: { imageId: result.imageId, alt: '' } }]
      : [],
  )
  const problem = results.find((result) => !result.ok)
  if (problem && !problem.ok) onProblem(problem.problem)
  if (images.length === 0 || editor.isDestroyed) return
  const { selection, doc } = editor.state
  const target =
    position === undefined
      ? { from: selection.from, to: selection.to }
      : Math.min(position, doc.content.size)
  editor.chain().focus().insertContentAt(target, images).run()
}

/* Pasted HTML pictures that aren't the journal's own (e.g. copied from a web page). */
function hasWebImages(html: string): boolean {
  if (!html.includes('<img')) return false
  const pasted = new DOMParser().parseFromString(html, 'text/html')
  return Array.from(pasted.images).some(
    (image) => !image.hasAttribute('data-image-id'),
  )
}

const WEB_IMAGES_PROBLEM =
  'Pictures from the web were left out, since the journal never goes online. Save one and add it instead.'

/**
 * Adding pictures: the file picker (toolbar button or shortcut), pasting
 * one (a screenshot, a copied file) or dropping files where they should go.
 */
export const ImageInsertion = Extension.create<ImageInsertionOptions>({
  name: 'imageInsertion',

  addOptions: () => ({ onProblem: () => undefined }),

  addCommands() {
    return {
      chooseImages:
        () =>
        ({ editor }) => {
          chooseFiles(IMAGE_ACCEPT, (files) =>
            insertImageFiles(editor, files, this.options.onProblem),
          )
          return true
        },
    }
  },

  addProseMirrorPlugins() {
    const { editor } = this
    const { onProblem } = this.options
    return [
      FileHandlePlugin({
        key: new PluginKey('imageFiles'),
        editor,
        // Every file is taken, so ones that can't be added say why rather than opening in the tab.
        allowedMimeTypes: undefined,
        consumePasteEvent: false,
        onDrop: (_editor, files, position) =>
          insertImageFiles(editor, files, onProblem, position),
        onPaste: (_editor, files) => insertImageFiles(editor, files, onProblem),
      }),
      new Plugin({
        key: new PluginKey('webImages'),
        props: {
          handlePaste: (_view, event) => {
            const { clipboardData } = event
            if (
              clipboardData?.files.length === 0 &&
              hasWebImages(clipboardData.getData('text/html'))
            )
              onProblem(WEB_IMAGES_PROBLEM)
            // The rest of the paste goes on as usual.
            return false
          },
        },
      }),
    ]
  },
})
