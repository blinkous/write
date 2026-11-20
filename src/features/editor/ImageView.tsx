import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { FileQuestionMark, TextCursorInput, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ActionList, MenuItem, OptionsMenu } from '../../design-system'
import { isImageId } from '../../journal-images'
import { AltTextDialog } from './AltTextDialog'
import { useImageUrl } from './useImageUrl'
import styles from './ImageView.module.css'

/**
 * A picture in the writing, at its own size up to the text's width, with a ⋯
 * (on hover, focus or while selected) to describe or delete it. One that isn't
 * on this device shows as a not-found tile, described the same.
 */
export function ImageView({
  node,
  selected,
  updateAttributes,
  deleteNode,
}: NodeViewProps) {
  const { imageId, alt } = node.attrs
  const shown = useImageUrl(isImageId(imageId) ? imageId : '')
  const description = typeof alt === 'string' ? alt : ''
  const [isAltTextOpen, setIsAltTextOpen] = useState(false)

  return (
    <NodeViewWrapper className={styles.image} data-selected={selected}>
      {shown.state === 'shown' && (
        <img src={shown.url} alt={description} draggable={false} />
      )}
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
    </NodeViewWrapper>
  )
}
