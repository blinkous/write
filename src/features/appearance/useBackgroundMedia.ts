import { useEffect, useState } from 'react'
import type { ToastMessage } from '../../design-system'
import { deleteBlob, readBlob, writeBlob } from '../../lib/blobStore'
import {
  BACKGROUND_MEDIA_STORAGE_KEY,
  checkBackgroundFile,
  getBackgroundMediaKind,
  type BackgroundMediaKind,
} from './backgroundMedia'

export type BackgroundMedia = { url: string; kind: BackgroundMediaKind }

function toBackgroundMedia(
  file: Blob,
  kind: BackgroundMediaKind,
): BackgroundMedia {
  return { url: URL.createObjectURL(file), kind }
}

/** The saved background picture or video, loaded once, with ways to change or remove it. */
export function useBackgroundMedia(onStatus: (message: ToastMessage) => void) {
  const [media, setMedia] = useState<BackgroundMedia | null>(null)

  useEffect(() => {
    let isCurrent = true
    readBlob(BACKGROUND_MEDIA_STORAGE_KEY).then((storedFile) => {
      const kind = storedFile && getBackgroundMediaKind(storedFile.type)
      if (isCurrent && storedFile && kind)
        setMedia(toBackgroundMedia(storedFile, kind))
    })
    return () => {
      isCurrent = false
    }
  }, [])

  // Each file's URL is freed once it's replaced or removed.
  useEffect(() => {
    if (!media) return
    return () => URL.revokeObjectURL(media.url)
  }, [media])

  /** Saves the file first, so the background shown is always the one that will come back. */
  async function chooseFile(file: File) {
    const check = checkBackgroundFile(file)
    if (!check.isUsable)
      return onStatus({ text: check.problem, tone: 'warning' })
    if (!(await writeBlob(BACKGROUND_MEDIA_STORAGE_KEY, file)))
      return onStatus({
        text: 'Couldn’t save that background in this browser.',
        tone: 'warning',
      })
    setMedia(toBackgroundMedia(file, check.kind))
  }

  async function remove() {
    if (!(await deleteBlob(BACKGROUND_MEDIA_STORAGE_KEY)))
      return onStatus({
        text: 'Couldn’t remove the background in this browser.',
        tone: 'warning',
      })
    setMedia(null)
  }

  return { media, chooseFile, remove }
}
