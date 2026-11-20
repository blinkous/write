import { useEffect, useRef, useState } from 'react'
import type { ToastMessage } from '../../design-system'
import {
  deleteUnusedBackgroundFiles,
  moveLegacyBackgroundFile,
  readBackgroundFile,
  storeBackgroundFile,
  type BackgroundFileUses,
  type LoadedBackgroundFile,
  type StoredBackgroundFile,
} from './backgroundFiles'
import { checkBackgroundFile } from './backgroundMedia'

export type BackgroundMedia = StoredBackgroundFile & { url: string }

type ShownFiles = ReadonlyMap<string, BackgroundMedia>

function toShownMedia({ file, ...stored }: LoadedBackgroundFile) {
  return { ...stored, url: URL.createObjectURL(file) }
}

/** Frees the URLs of files nothing can show anymore. */
function freeShownFiles(
  shownFiles: ShownFiles,
  keptIds: ReadonlySet<string>,
): ShownFiles {
  const kept = new Map(shownFiles)
  for (const [fileId, { url }] of shownFiles)
    if (!keptIds.has(fileId)) {
      URL.revokeObjectURL(url)
      kept.delete(fileId)
    }
  return kept
}

type BackgroundMediaOptions = Omit<BackgroundFileUses, 'keptFileIds'> & {
  /** The current background's stored file (a setting), or null for none. */
  fileId: string | null
  /** A new background, or none, as one undo step. */
  onFileChange: (fileId: string | null) => void
  /** Corrects the setting without an undo step (a moved old file, or one that's gone). */
  onFileReplaced: (fileId: string | null) => void
  /** Files theme packs keep. */
  packFileIds: readonly string[]
  onStatus: (message: ToastMessage) => void
}

/**
 * Shows the background the settings point to, and changes it: a new file is
 * stored first, so what's shown is always what comes back. Files that neither
 * it, the packs nor recent undo steps (within their budget) use are deleted.
 */
export function useBackgroundMedia({
  fileId,
  onFileChange,
  onFileReplaced,
  packFileIds,
  undoFileIds,
  undoBudgetBytes,
  onStatus,
}: BackgroundMediaOptions) {
  /*
   * Each file shown this visit, by content name, so showing it again (undo,
   * or switching back to a pack) reuses its URL and the browser's decoded
   * copy instead of reading and decoding it all over again.
   */
  const [shownFiles, setShownFiles] = useState<ShownFiles>(() => new Map())
  const media = (fileId && shownFiles.get(fileId)) || null
  const uses: BackgroundFileUses = {
    keptFileIds: [...packFileIds, ...(fileId ? [fileId] : [])],
    undoFileIds,
    undoBudgetBytes,
  }
  // The latest, for async work and the sweep to read without restarting.
  const latestRef = useRef({ onFileReplaced, onStatus, uses, shownFiles })
  const usesKey = JSON.stringify([
    uses.keptFileIds.toSorted(),
    undoFileIds,
    undoBudgetBytes,
  ])

  useEffect(() => {
    latestRef.current = { onFileReplaced, onStatus, uses, shownFiles }
  })

  function addShownFile(shown: BackgroundMedia) {
    setShownFiles((files) => new Map(files).set(shown.fileId, shown))
  }

  // Reads the current file the first time it's shown.
  useEffect(() => {
    const load = new AbortController()
    if (!fileId) {
      // Settings from before the shared files may still point to a file saved the old way.
      moveLegacyBackgroundFile().then((movedFileId) => {
        if (movedFileId && !load.signal.aborted)
          latestRef.current.onFileReplaced(movedFileId)
      })
      return () => load.abort()
    }
    if (latestRef.current.shownFiles.has(fileId)) return
    readBackgroundFile(fileId).then((loaded) => {
      if (load.signal.aborted) return
      if (loaded) return addShownFile(toShownMedia(loaded))
      latestRef.current.onStatus({
        text: 'That background isn’t in this browser anymore, so it’s been removed.',
        tone: 'warning',
      })
      latestRef.current.onFileReplaced(null)
    })
    return () => load.abort()
  }, [fileId])

  // After any change of what uses which file: drop what nothing keeps, then free what can't be shown.
  useEffect(() => {
    const { uses: latestUses } = latestRef.current
    const keptIds = new Set([
      ...latestUses.keptFileIds,
      ...latestUses.undoFileIds,
    ])
    deleteUnusedBackgroundFiles(latestUses).then(() =>
      setShownFiles((files) => freeShownFiles(files, keptIds)),
    )
  }, [usesKey])

  // Every URL is freed when the app goes away.
  useEffect(
    () => () => {
      freeShownFiles(latestRef.current.shownFiles, new Set())
    },
    [],
  )

  /** Stores the file first, so the background shown is always the one that will come back. */
  async function chooseFile(file: File) {
    const check = checkBackgroundFile(file)
    if (!check.isUsable)
      return onStatus({ text: check.problem, tone: 'warning' })
    const stored = await storeBackgroundFile(file)
    if (!stored)
      return onStatus({
        text: 'Couldn’t save that background in this browser.',
        tone: 'warning',
      })
    if (!shownFiles.has(stored.fileId))
      addShownFile(toShownMedia({ ...stored, file }))
    onFileChange(stored.fileId)
  }

  return { media, chooseFile, remove: () => onFileChange(null) }
}
