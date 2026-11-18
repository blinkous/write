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

type BackgroundMediaLayerProps = BackgroundMedia & {
  /** px; 0 for none. */
  blur: number
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
  const filterId = getBlurFilterId(blur)
  const filter = blur > 0 ? `url(#${filterId})` : undefined
  return (
    <div
      className={styles.layer}
      data-background-media={kind}
      aria-hidden="true"
    >
      {/*
       * A blur that stays opaque to the edges. CSS blur() fades the edges into
       * transparency, and WebKit's GPU path clips the media to the window
       * before blurring, so the page color showed at the window's edges; making
       * the result opaque again keeps each edge pixel's blurred color instead.
       * Limited to the media's own box (x/y/width/height), so nothing outside
       * it turns opaque.
       */}
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
      {kind === 'image' ? (
        <img className={styles.media} style={{ filter }} src={url} alt="" />
      ) : (
        <BackgroundVideo
          url={url}
          className={styles.media}
          style={{ filter }}
          isPaused={isVideoPaused}
          speed={videoSpeed}
        />
      )}
    </div>
  )
}
