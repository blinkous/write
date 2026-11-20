import { useEffect, useRef } from 'react'

type StillFrameProps = {
  url: string
  /** Read in its place, as for the picture itself; none makes it decorative. */
  alt: string
}

/**
 * A GIF held still on its first frame: browsers can't pause an <img>, so
 * the frame is drawn once onto a canvas, at the picture's own size.
 */
export function StillFrame({ url, alt }: StillFrameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const picture = new Image()
    picture.onload = () => {
      const canvas = canvasRef.current
      const context = canvas?.getContext('2d')
      if (!canvas || !context) return
      canvas.width = picture.naturalWidth
      canvas.height = picture.naturalHeight
      context.drawImage(picture, 0, 0)
    }
    picture.src = url
    return () => {
      picture.onload = null
    }
  }, [url])

  return alt ? (
    <canvas ref={canvasRef} role="img" aria-label={alt} />
  ) : (
    <canvas ref={canvasRef} aria-hidden="true" />
  )
}
