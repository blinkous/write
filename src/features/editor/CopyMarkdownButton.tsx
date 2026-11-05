import type { Editor } from '@tiptap/react'
import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../design-system'
import { copyTextToClipboard } from '../../lib/clipboard'
import { getEditorMarkdown } from './getEditorMarkdown'

type CopyStatus = 'idle' | 'copied' | 'failed'

/* Announced to screen readers after a copy; the icon shows the same visually. */
const STATUS_ANNOUNCEMENTS: Record<CopyStatus, string> = {
  idle: '',
  copied: 'Copied as markdown',
  failed: 'Copy failed',
}

const STATUS_RESET_DELAY_MS = 2000

export function CopyMarkdownButton({ editor }: { editor: Editor }) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')

  useEffect(() => {
    if (copyStatus === 'idle') return
    const resetTimer = window.setTimeout(
      () => setCopyStatus('idle'),
      STATUS_RESET_DELAY_MS,
    )
    return () => window.clearTimeout(resetTimer)
  }, [copyStatus])

  async function copyMarkdown() {
    const didCopy = await copyTextToClipboard(getEditorMarkdown(editor))
    setCopyStatus(didCopy ? 'copied' : 'failed')
  }

  return (
    <Button
      iconOnly
      aria-label="Copy as markdown"
      title="Copy as markdown"
      onClick={copyMarkdown}
    >
      {copyStatus === 'copied' ? (
        <Check aria-hidden="true" />
      ) : (
        <Copy aria-hidden="true" />
      )}
      <span aria-live="polite" className="visually-hidden">
        {STATUS_ANNOUNCEMENTS[copyStatus]}
      </span>
    </Button>
  )
}
