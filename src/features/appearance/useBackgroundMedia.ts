import { useEffect, useRef, useState } from 'react'
import type { ToastMessage } from '../../design-system'
import {
  deleteUnusedBackgroundFiles,
  moveLegacyBackgroundFile,
  getBackgroundFileId,
  readBackgroundFile,
  storeBackgroundFile,
  type LoadedBackgroundFile,
  type StoredBackgroundFile,
} from './backgroundFiles'
import { checkBackgroundFile } from './backgroundMedia'
import { checkBackgroundRoom, type PackBackground } from './themePackBackground'

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

type BackgroundMediaOptions = {
  /** The current background's stored file (a setting), or null for none. */
  fileId: string | null
  /** A new background, or none, as one undo step. */
  onFileChange: (fileId: string | null) => void
  /** Corrects the setting without an undo step (a moved old file, or one that's gone). */
  onFileReplaced: (fileId: string | null) => void
  /** The packs' backgrounds: their files are kept, and new ones must fit beside them. */
  packBackgrounds: readonly PackBackground[]
  onStatus: (message: ToastMessage) => void
}

/**
 * Shows the background the settings point to, and changes it: a new file must
 * fit the room backgrounds have, and is stored first, so what's shown is
 * always what comes back. Files neither it nor the packs use are deleted; a
 * setting that points to one of those (e.g. after undo) says so (`isMissing`)
 * rather than changing, so undo and redo stay true.
 */
export function useBackgroundMedia({
  fileId,
  onFileChange,
  onFileReplaced,
  packBackgrounds,
  onStatus,
}: BackgroundMediaOptions) {
  /*
   * Each file shown this visit, by content name, so showing it again (undo,
   * or switching back to a pack) reuses its URL and the browser's decoded
   * copy instead of reading and decoding it all over again.
   */
  const [shownFiles, setShownFiles] = useState<ShownFiles>(() => new Map())
  // Files the settings point to that aren't in this browser anymore (e.g. a replaced one, after undo).
  const [missingFileIds, setMissingFileIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  // Why the last chosen file wasn't used (no room), until it's acknowledged.
  const [roomProblem, setRoomProblem] = useState<string | null>(null)
  const packFileIds = packBackgrounds.flatMap((background) =>
    background.state === 'file' ? [background.fileId] : [],
  )
  const media = (fileId && shownFiles.get(fileId)) || null
  const keptFileIds = [...packFileIds, ...(fileId ? [fileId] : [])]
  // The latest, for async work and the sweep to read without restarting.
  const latestRef = useRef({ onFileReplaced, keptFileIds, shownFiles })
  const keptFileIdsKey = keptFileIds.toSorted().join()

  useEffect(() => {
    latestRef.current = { onFileReplaced, keptFileIds, shownFiles }
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
      // Kept as the setting, so undo and redo stay true; the tile says it's gone.
      setMissingFileIds((fileIds) => new Set(fileIds).add(fileId))
    })
    return () => load.abort()
  }, [fileId])

  // After any change of which files are used: drop the rest, then free what can't be shown.
  useEffect(() => {
    const { keptFileIds: latestKeptFileIds } = latestRef.current
    deleteUnusedBackgroundFiles(latestKeptFileIds).then(() =>
      setShownFiles((files) =>
        freeShownFiles(files, new Set(latestKeptFileIds)),
      ),
    )
  }, [keptFileIdsKey])

  // Every URL is freed when the app goes away.
  useEffect(
    () => () => {
      freeShownFiles(latestRef.current.shownFiles, new Set())
    },
    [],
  )

  /** Checks there's room, then stores the file first, so the background shown is always the one that comes back. */
  async function chooseFile(file: File) {
    const check = checkBackgroundFile(file)
    if (!check.isUsable)
      return onStatus({ text: check.problem, tone: 'warning' })
    const newFileId = await getBackgroundFileId(file)
    const room = checkBackgroundRoom(
      { fileId: newFileId, bytes: file.size },
      packBackgrounds,
    )
    if (!room.fits) return setRoomProblem(room.problem)
    const stored = await storeBackgroundFile(file, newFileId)
    if (!stored)
      return onStatus({
        text: 'Couldn’t save that background in this browser.',
        tone: 'warning',
      })
    if (!shownFiles.has(stored.fileId))
      addShownFile(toShownMedia({ ...stored, file }))
    onFileChange(stored.fileId)
  }

  return {
    media,
    /** The settings point to a background that isn't in this browser anymore. */
    isMissing: !media && fileId !== null && missingFileIds.has(fileId),
    chooseFile,
    remove: () => onFileChange(null),
    /** Why the last chosen file couldn't be the background, until acknowledged. */
    roomProblem,
    dismissRoomProblem: () => setRoomProblem(null),
  }
}
