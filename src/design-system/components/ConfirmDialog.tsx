import { Button } from './Button'
import { Dialog } from './Dialog'

type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  message: string
  confirmLabel: string
  /** "danger" for destructive actions like deleting. */
  tone?: 'neutral' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

/** Asks before an action. Cancel comes first, so it gets focus and Enter never confirms by accident. */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  tone = 'neutral',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      actions={
        <>
          <Button variant="subtle" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'subtle'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Dialog>
  )
}
