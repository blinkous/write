import { useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button, Dialog, Text, TextInput } from '../../design-system'
import styles from './AltTextDialog.module.css'

type AltTextDialogProps = {
  isOpen: boolean
  alt: string
  onSave: (alt: string) => void
  onClose: () => void
}

/**
 * Describes a picture for screen readers and markdown. Rendered outside the
 * writing, so typing here never reaches the editor.
 */
export function AltTextDialog({
  isOpen,
  alt,
  onSave,
  onClose,
}: AltTextDialogProps) {
  const [draft, setDraft] = useState(alt)
  // Each opening starts from the picture's current description.
  const [wasOpen, setWasOpen] = useState(isOpen)
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) setDraft(alt)
  }
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const hintId = useId()

  function save() {
    onSave(draft.trim())
    onClose()
  }

  return createPortal(
    <Dialog
      isOpen={isOpen}
      title="Alt text"
      onClose={onClose}
      firstTabStopRef={inputRef}
      actions={
        <>
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="subtle" onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <form
        className={styles.field}
        onSubmit={(event) => {
          event.preventDefault()
          save()
        }}
      >
        <label htmlFor={inputId}>Describe the picture</label>
        <TextInput
          ref={inputRef}
          id={inputId}
          value={draft}
          aria-describedby={hintId}
          onChange={({ currentTarget }) => setDraft(currentTarget.value)}
        />
        <Text id={hintId} variant="caption">
          Read in its place by screen readers, and kept in markdown.
        </Text>
      </form>
    </Dialog>,
    document.body,
  )
}
