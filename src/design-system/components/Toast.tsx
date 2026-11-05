import { useEffect } from 'react'
import styles from './Toast.module.css'

export type ToastMessage = {
  text: string
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
        <p className={`${styles.toast} ${styles[message.tone]}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}
