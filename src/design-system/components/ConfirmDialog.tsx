import { Button } from './Button'
import { Dialog } from './Dialog'

type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

/** Asks before an action. Cancel comes first, so it gets focus and Enter never confirms by accident. */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
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
          <Button variant="subtle" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Dialog>
  )
}
