export type SaveFileOptions = {
  suggestedName: string
  /**
   * What to save: text, a file, or a way to read it. Read only once the save
   * dialog has opened, since the dialog needs a recent click or key press and
   * reading a big journal (pictures included) can take a while.
   */
  contents: string | Blob | (() => Promise<string | Blob>)
  mimeType: string
  /** Shown in the save dialog's file type list, e.g. "Journal export". */
  description: string
  extension: `.${string}`
}

export type SaveFileResult =
  | { status: 'saved'; fileName: string }
  | { status: 'downloaded'; fileName: string }
  | { status: 'cancelled' }

/* The File System Access save dialog exists only in Chromium browsers. */
declare global {
  interface Window {
    showSaveFilePicker?: (options: {
      suggestedName: string
      types: { description: string; accept: Record<string, string[]> }[]
    }) => Promise<FileSystemFileHandle>
  }
}

function isCancellation(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

/**
 * Asks where to save via the system Save dialog. Browsers without one fall
 * back to a regular download, reported as such so the user can be told.
 * Must be called directly from a user action (the dialog requires it).
 */
function readContents({ contents }: SaveFileOptions): Promise<string | Blob> {
  return typeof contents === 'function' ? contents() : Promise.resolve(contents)
}

export async function saveFile(
  options: SaveFileOptions,
): Promise<SaveFileResult> {
  const { suggestedName, mimeType, description, extension } = options
  const { showSaveFilePicker } = window
  if (!showSaveFilePicker) {
    downloadFile(suggestedName, await readContents(options), mimeType)
    return { status: 'downloaded', fileName: suggestedName }
  }

  let fileHandle
  try {
    fileHandle = await showSaveFilePicker.call(window, {
      suggestedName,
      types: [{ description, accept: { [mimeType]: [extension] } }],
    })
  } catch (error) {
    if (isCancellation(error)) return { status: 'cancelled' }
    throw error
  }
  const contents = await readContents(options)
  const writable = await fileHandle.createWritable()
  await writable.write(contents)
  await writable.close()
  return { status: 'saved', fileName: fileHandle.name }
}

function downloadFile(
  fileName: string,
  contents: string | Blob,
  mimeType: string,
): void {
  const objectUrl = URL.createObjectURL(
    new Blob([contents], { type: mimeType }),
  )
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName
  link.click()
  URL.revokeObjectURL(objectUrl)
}

/** What to tell the user after an export; nothing if they cancelled the dialog. */
export function describeSaveResult(
  result: SaveFileResult,
): { text: string; tone: 'neutral' } | null {
  switch (result.status) {
    case 'saved':
      return { text: `Saved ${result.fileName}.`, tone: 'neutral' }
    case 'downloaded':
      return {
        text: `This browser can’t ask where to save, so ${result.fileName} went to your Downloads folder.`,
        tone: 'neutral',
      }
    case 'cancelled':
      return null
  }
}
