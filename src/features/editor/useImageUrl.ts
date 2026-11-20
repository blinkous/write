import { useEffect, useState } from 'react'
import { acquireImageUrl, releaseImageUrl } from '../../journal-images'

export type ShownImage =
  { state: 'loading' } | { state: 'shown'; url: string } | { state: 'missing' }

/** A stored picture to show while mounted (freed after), or that it isn't on this device. */
export function useImageUrl(imageId: string): ShownImage {
  const [loaded, setLoaded] = useState<{
    imageId: string
    url: string | null
  }>()

  useEffect(() => {
    let isCurrent = true
    void acquireImageUrl(imageId).then((url) => {
      if (isCurrent) setLoaded({ imageId, url })
    })
    return () => {
      isCurrent = false
      releaseImageUrl(imageId)
    }
  }, [imageId])

  if (loaded?.imageId !== imageId) return { state: 'loading' }
  return loaded.url ? { state: 'shown', url: loaded.url } : { state: 'missing' }
}
