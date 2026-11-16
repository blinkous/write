import { useEffect } from 'react'
import styles from './Toast.module.css'
import { WarningIcon } from './WarningIcon'

export type ToastMessage = {
  text: string
  /** "warning" marks something gone wrong with a warning icon before the text. */
  tone: 'neutral' | 'warning'
}

type ToastProps = {
  message: ToastMessage | null
  onDismiss: () => void
}

const TOAST_DURATION_MS = 5000

/** Brief status message. The region is always rendered so screen readers announce changes. */
export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const dismissTimer = window.setTimeout(onDismiss, TOAST_DURATION_MS)
    return () => window.clearTimeout(dismissTimer)
  }, [message, onDismiss])

  return (
    <div role="status" className={styles.region}>
      {message && (
        <p className={styles.toast}>
          {message.tone === 'warning' && <WarningIcon />}
          {message.text}
        </p>
      )}
    </div>
  )
}
