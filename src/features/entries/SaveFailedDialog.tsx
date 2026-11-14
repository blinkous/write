import { Download, FileText, SlidersHorizontal } from 'lucide-react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Button, Dialog, type ToastMessage } from '../../design-system'
import { getSaveFailure, subscribeToSaveFailure } from '../../lib/saveStatus'

type SaveFailedDialogProps = {
  onExportAll: () => void
  onExportAllAsMarkdown: () => void
  onExportSettings: () => void
  /** Told when saving works again, after a failure. */
  onStatus: (message: ToastMessage) => void
}

const SAVING_AGAIN_MESSAGE: ToastMessage = {
  text: 'Your changes are saving again.',
  tone: 'neutral',
}

/**
 * Says when saving fails (the writing or settings; see lib/saveStatus) and
 * offers the exports, so nothing is lost. Once dismissed, it stays closed for
 * that run of failed saves, and shows again if saving recovers and later
 * fails. Closes by itself, with a note, when saving works again.
 */
export function SaveFailedDialog({
  onExportAll,
  onExportAllAsMarkdown,
  onExportSettings,
  onStatus,
}: SaveFailedDialogProps) {
  const saveFailure = useSyncExternalStore(
    subscribeToSaveFailure,
    getSaveFailure,
  )
  const [dismissedFailure, setDismissedFailure] = useState<number | null>(null)
  const previousFailureRef = useRef(saveFailure)
  const onStatusRef = useRef(onStatus)
  useEffect(() => {
    onStatusRef.current = onStatus
  })

  useEffect(() => {
    const hasRecovered =
      previousFailureRef.current !== null && saveFailure === null
    previousFailureRef.current = saveFailure
    if (hasRecovered) onStatusRef.current(SAVING_AGAIN_MESSAGE)
  }, [saveFailure])

  const dismiss = () => setDismissedFailure(saveFailure)
  return (
    <Dialog
      isOpen={saveFailure !== null && saveFailure !== dismissedFailure}
      title="Save failed"
      tone="warning"
      opensUnprompted
      onClose={dismiss}
      actions={
        <>
          <Button variant="subtle" onClick={dismiss}>
            Dismiss
          </Button>
          <Button variant="subtle" onClick={onExportAll}>
            <Download aria-hidden="true" />
            Export as JSON
          </Button>
          <Button variant="subtle" onClick={onExportAllAsMarkdown}>
            <FileText aria-hidden="true" />
            Export as markdown
          </Button>
          <Button variant="subtle" onClick={onExportSettings}>
            <SlidersHorizontal aria-hidden="true" />
            Export settings
          </Button>
        </>
      }
    >
      <p>
        There was an error saving your changes. Your storage might be full or
        permissions might be needed.
      </p>
    </Dialog>
  )
}
