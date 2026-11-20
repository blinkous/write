import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import {
  FileQuestionMark,
  Pause,
  Play,
  TextCursorInput,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { ActionList, MenuItem, OptionsMenu } from '../../design-system'
import { isImagePlayback, isTextAlignment } from '../../journal-document'
import { isAnimatedImage, isImageId } from '../../journal-images'
import { prefersReducedMotion } from '../../utils/motion'
import { AltTextDialog } from './AltTextDialog'
import { StillFrame } from './StillFrame'
import { useImageUrl } from './useImageUrl'
import styles from './ImageView.module.css'

/**
 * A picture in the writing, at its own size up to the text's width, with a ⋯
 * (on hover, focus or while selected) to describe or delete it, and to pause
 * or play a GIF. A GIF no one has paused or played follows the system: still
 * when it asks for less motion. One that isn't on this device shows as a
 * not-found tile, described the same.
 */
export function ImageView({
  node,
  selected,
  updateAttributes,
  deleteNode,
}: NodeViewProps) {
  const { imageId, alt, playback, alignment } = node.attrs
  const validImageId = isImageId(imageId) ? imageId : ''
  const shown = useImageUrl(validImageId)
  const description = typeof alt === 'string' ? alt : ''
  const isAnimated = isAnimatedImage(validImageId)
  const chosenPlayback = isImagePlayback(playback) ? playback : null
  const isPaused =
    isAnimated &&
    (chosenPlayback ?? (prefersReducedMotion() ? 'paused' : 'playing')) ===
      'paused'
  const [isAltTextOpen, setIsAltTextOpen] = useState(false)

  return (
    // Its line lines up the picture: its own alignment, or Body's.
    <NodeViewWrapper
      className={styles.line}
      data-align={isTextAlignment(alignment) ? alignment : undefined}
    >
      <div className={styles.image} data-selected={selected}>
        {shown.state === 'shown' &&
          (isPaused ? (
            <StillFrame url={shown.url} alt={description} />
          ) : (
            <img src={shown.url} alt={description} draggable={false} />
          ))}
        {shown.state === 'missing' && (
          <div
            className={styles.missing}
            role="img"
            aria-label={
              description
                ? `${description} (picture not found)`
                : 'Picture not found'
            }
          >
            <FileQuestionMark aria-hidden="true" />
          </div>
        )}
        <OptionsMenu label="Picture options" className={styles.options}>
          {(close) => (
            <ActionList>
              {isAnimated && (
                <MenuItem
                  icon={isPaused ? Play : Pause}
                  onClick={() => {
                    close()
                    updateAttributes({
                      playback: isPaused ? 'playing' : 'paused',
                    })
                  }}
                >
                  {isPaused ? 'Play GIF' : 'Pause GIF'}
                </MenuItem>
              )}
              <MenuItem
                icon={TextCursorInput}
                onClick={() => {
                  close()
                  setIsAltTextOpen(true)
                }}
              >
                Alt text
              </MenuItem>
              <MenuItem
                icon={Trash2}
                onClick={() => {
                  close()
                  deleteNode()
                }}
              >
                Delete picture
              </MenuItem>
            </ActionList>
          )}
        </OptionsMenu>
        <AltTextDialog
          isOpen={isAltTextOpen}
          alt={description}
          onSave={(nextAlt) => updateAttributes({ alt: nextAlt })}
          onClose={() => setIsAltTextOpen(false)}
        />
      </div>
    </NodeViewWrapper>
  )
}
