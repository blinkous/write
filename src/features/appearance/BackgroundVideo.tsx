import { useEffect, useRef } from 'react'

type BackgroundVideoProps = {
  url: string
  className: string
  isPaused: boolean
  /** × normal speed. */
  speed: number
}

/**
 * A background video looping silently, played or held still and sped up or
 * slowed down from settings. The element is driven directly, so pausing or
 * changing speed never reloads the video.
 */
export function BackgroundVideo({
  url,
  className,
  isPaused,
  speed,
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // A new file resets the speed, so it's set again whenever the url changes.
  useEffect(() => {
    const { current: video } = videoRef
    if (!video) return
    video.defaultPlaybackRate = speed
    video.playbackRate = speed
  }, [url, speed])

  useEffect(() => {
    const { current: video } = videoRef
    if (!video) return
    if (isPaused) return video.pause()
    // The browser may refuse to play (e.g. iOS Low Power Mode): the video then
    // stays on its first frame, which is fine for a background.
    video.play().catch(() => {})
  }, [url, isPaused])

  return (
    <video
      ref={videoRef}
      className={className}
      src={url}
      muted
      loop
      playsInline
    />
  )
}
