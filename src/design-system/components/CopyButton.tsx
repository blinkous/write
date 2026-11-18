import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { copyTextToClipboard } from '../../lib/clipboard'
import styles from './CopyButton.module.css'

/** How long the check (or the failure note) shows after a copy. */
const COPY_FEEDBACK_MS = 1500

type CopyResult = 'copied' | 'failed' | null

const COPY_ANNOUNCEMENTS: Record<NonNullable<CopyResult>, string> = {
  copied: 'Copied',
  failed: 'Couldn’t copy to the clipboard',
}

type CopyButtonProps = {
  /** Names what's copied, e.g. "Copy color". */
  label: string
  text: string
}

/**
 * A small copy icon, e.g. at the end of a field. After a copy it shows a check
 * for a moment; the result is announced to screen readers either way.
 */
export function CopyButton({ label, text }: CopyButtonProps) {
  const [result, setResult] = useState<CopyResult>(null)

  useEffect(() => {
    if (result === null) return
    const timeout = window.setTimeout(() => setResult(null), COPY_FEEDBACK_MS)
    return () => window.clearTimeout(timeout)
  }, [result])

  return (
    <>
      <button
        type="button"
        className={styles.copyButton}
        aria-label={label}
        title={label}
        onClick={async () =>
          setResult((await copyTextToClipboard(text)) ? 'copied' : 'failed')
        }
      >
        {result === 'copied' ? (
          <Check aria-hidden="true" />
        ) : (
          <Copy aria-hidden="true" />
        )}
      </button>
      <span className="visually-hidden" aria-live="polite">
        {result && COPY_ANNOUNCEMENTS[result]}
      </span>
    </>
  )
}
