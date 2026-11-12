import { Button, Dialog } from '../../design-system'
import {
  PRIVACY_NOTES,
  WELCOME_INTRO,
  WELCOME_SIGN_OFF,
  WELCOME_TITLE,
} from './privacyNotes'
import styles from './PrivacyNotice.module.css'

type PrivacyNoticeProps = {
  isOpen: boolean
  onClose: () => void
}

/** About: the author's note on what this is, then how your data is kept. */
export function PrivacyNotice({ isOpen, onClose }: PrivacyNoticeProps) {
  return (
    <Dialog
      isOpen={isOpen}
      title={WELCOME_TITLE}
      onClose={onClose}
      actions={
        <Button variant="subtle" onClick={onClose}>
          {WELCOME_SIGN_OFF}
        </Button>
      }
    >
      <p>{WELCOME_INTRO}</p>
      <ul className={styles.notes}>
        {PRIVACY_NOTES.map(({ icon: Icon, lines }) => (
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
