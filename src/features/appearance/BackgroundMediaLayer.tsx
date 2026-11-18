import { BackgroundVideo } from './BackgroundVideo'
import type { BackgroundMedia } from './useBackgroundMedia'
import styles from './BackgroundMediaLayer.module.css'

/*
 * The filter's id names its blur, so each new blur is a new filter reference:
 * WebKit doesn't redraw an element when only the referenced filter's
 * attributes change, so the new blur showed late. There's only ever one
 * background, so the id is otherwise fixed.
 */
function getBlurFilterId(blur: number): string {
  return `background-media-blur-${String(blur).replace('.', '_')}`
}

/** px; 0 for none. */
type BlurProps = { blur: number }

/**
 * A picture blurred by an SVG filter that stays opaque to the edges. CSS
 * blur() fades the edges into transparency, and WebKit's GPU path clips the
 * media to the window before blurring, so the page color showed at the
 * window's edges; making the result opaque again keeps each edge pixel's
 * blurred color instead. Limited to the picture's own box (x/y/width/height),
 * so nothing outside it turns opaque.
 */
function BackgroundImage({ url, blur }: { url: string } & BlurProps) {
  const filterId = getBlurFilterId(blur)
  const filter = blur > 0 ? `url(#${filterId})` : undefined
  return (
    <>
      <svg className={styles.filterDefinitions} aria-hidden="true">
        <filter
          id={filterId}
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation={blur} />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="1 1" />
          </feComponentTransfer>
        </filter>
      </svg>
      <img className={styles.media} style={{ filter }} src={url} alt="" />
    </>
  )
}

/**
 * A video blurred by a see-through layer over it (backdrop-filter): WebKit
 * doesn't apply SVG filters to playing video, so the picture's blur left
 * videos sharp.
 */
function VideoBlur({ blur }: BlurProps) {
  if (blur <= 0) return null
  return (
    <div
      className={styles.videoBlur}
      style={{ backdropFilter: `blur(${blur}px)` }}
    />
  )
}

type BackgroundMediaLayerProps = BackgroundMedia &
  BlurProps & {
    isVideoPaused: boolean
    /** × normal speed. */
    videoSpeed: number
  }

/**
 * The picture or video behind the whole window, blurred and see-through to the
 * page color (both from settings). Decorative, so hidden from screen readers.
 * Marked with `data-background-media` so the layout can make its panels
 * translucent over it.
 */
export function BackgroundMediaLayer({
  url,
  kind,
  blur,
  isVideoPaused,
  videoSpeed,
}: BackgroundMediaLayerProps) {
  return (
    <div
      className={styles.layer}
      data-background-media={kind}
      aria-hidden="true"
    >
      {kind === 'image' ? (
        <BackgroundImage url={url} blur={blur} />
      ) : (
        <>
          <BackgroundVideo
            url={url}
            className={styles.media}
            isPaused={isVideoPaused}
            speed={videoSpeed}
          />
          <VideoBlur blur={blur} />
        </>
      )}
    </div>
  )
}
