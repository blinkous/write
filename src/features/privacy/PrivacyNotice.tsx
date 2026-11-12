import { Lock, TriangleAlert, WifiOff, type LucideIcon } from 'lucide-react'
import { Button, Dialog } from '../../design-system'
import styles from './PrivacyNotice.module.css'

type PrivacyNoticeProps = {
  isOpen: boolean
  onClose: () => void
}

/* The author's words; edit for grammar only, keeping the voice. */
const NOTES: readonly { icon: LucideIcon; lines: readonly string[] }[] = [
  {
    icon: Lock,
    lines: [
      'All data is stored locally in the browser.',
      'Your data is cleared when you clear browser data; to save, export it.',
      'You can import saved entries anytime.',
    ],
  },
  { icon: WifiOff, lines: ['Once loaded, this page works offline.'] },
  {
    icon: TriangleAlert,
    lines: [
      'Your browser extensions may read data on all sites.',
      'Disable extensions or use a different profile or a browser without them for a private experience.',
    ],
  },
]

/** The welcome: a note from the author about what this is, then how your data is kept. */
export function PrivacyNotice({ isOpen, onClose }: PrivacyNoticeProps) {
  return (
    <Dialog
      isOpen={isOpen}
      title="Welcome!"
      onClose={onClose}
      actions={
        <Button variant="subtle" onClick={onClose}>
          Write away!
        </Button>
      }
    >
      <p>
        This is a simple journaling app. I created this as a quick, cozy, and
        private place to jot things down. No account, no cloud, just you and the
        page. Hope you enjoy!
      </p>
      <ul className={styles.notes}>
        {NOTES.map(({ icon: Icon, lines }) => (
          <li key={lines[0]} className={styles.note}>
            <Icon aria-hidden="true" className={styles.icon} />
            <span className={styles.lines}>
              {lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </Dialog>
  )
}
