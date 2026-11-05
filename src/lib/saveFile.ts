type SaveFileOptions = {
  suggestedName: string
  text: string
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
export async function saveTextFile({
  suggestedName,
  text,
  mimeType,
  description,
  extension,
}: SaveFileOptions): Promise<SaveFileResult> {
  const { showSaveFilePicker } = window
  if (!showSaveFilePicker) {
    downloadTextFile(suggestedName, text, mimeType)
    return { status: 'downloaded', fileName: suggestedName }
  }

  try {
    const fileHandle = await showSaveFilePicker.call(window, {
      suggestedName,
      types: [{ description, accept: { [mimeType]: [extension] } }],
    })
    const writable = await fileHandle.createWritable()
    await writable.write(text)
    await writable.close()
    return { status: 'saved', fileName: fileHandle.name }
  } catch (error) {
    if (isCancellation(error)) return { status: 'cancelled' }
    throw error
  }
}

function downloadTextFile(
  fileName: string,
  text: string,
  mimeType: string,
): void {
  const objectUrl = URL.createObjectURL(new Blob([text], { type: mimeType }))
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName
  link.click()
  URL.revokeObjectURL(objectUrl)
}
