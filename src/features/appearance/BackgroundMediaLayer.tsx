import { prefersReducedMotion } from '../../utils/motion'
import type { BackgroundMedia } from './useBackgroundMedia'
import styles from './BackgroundMediaLayer.module.css'

/**
 * The picture or video behind the whole window, blurred and faded toward the
 * page color (both from settings). Decorative, so hidden from screen readers.
 * Marked with `data-background-media` so the layout can make its panels
 * translucent over it.
 */
export function BackgroundMediaLayer({ url, kind }: BackgroundMedia) {
  return (
    <div
      className={styles.layer}
      data-background-media={kind}
      aria-hidden="true"
    >
      {kind === 'image' ? (
        <img className={styles.media} src={url} alt="" />
      ) : (
        // Loops silently; held on its first frame when the system asks for less motion.
        <video
          className={styles.media}
          src={url}
          autoPlay={!prefersReducedMotion()}
          muted
          loop
          playsInline
        />
      )}
    </div>
  )
}
