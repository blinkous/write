/*
 * The picture, GIF or video behind the whole window. The file lives in
 * IndexedDB (too big for localStorage); its blur, opacity and video playback are appearance
 * settings, so they're saved and exported with the rest of the look.
 */

export type BackgroundMediaKind = 'image' | 'video'

/** Where the file is kept (see lib/blobStore). */
export const BACKGROUND_MEDIA_STORAGE_KEY = 'background-media.v1'

/** For the file picker. */
export const BACKGROUND_MEDIA_ACCEPT = 'image/*,video/*'

/** Generous for a looping video, small enough not to strain the browser's storage. */
export const BACKGROUND_MEDIA_MAX_MEGABYTES = 100
const BACKGROUND_MEDIA_MAX_BYTES = BACKGROUND_MEDIA_MAX_MEGABYTES * 1024 * 1024

/** Pictures (including GIFs) and videos; null for anything else. */
export function getBackgroundMediaKind(
  mimeType: string,
): BackgroundMediaKind | null {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  return null
}

type BackgroundFileCheck =
  | { isUsable: true; kind: BackgroundMediaKind }
  | { isUsable: false; problem: string }

/** Whether a chosen file can be the background, and if not, why (shown to the person). */
export function checkBackgroundFile({
  type,
  size,
}: Pick<File, 'type' | 'size'>): BackgroundFileCheck {
  const kind = getBackgroundMediaKind(type)
  if (!kind)
    return {
      isUsable: false,
      problem: 'That file isn’t a picture or video.',
    }
  if (size > BACKGROUND_MEDIA_MAX_BYTES)
    return {
      isUsable: false,
      problem: `That file is over ${BACKGROUND_MEDIA_MAX_MEGABYTES} MB. Try a smaller or shorter one.`,
    }
  return { isUsable: true, kind }
}
