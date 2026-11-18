import { siGithub } from 'simple-icons'
import {
  BrandIcon,
  Button,
  Dialog,
  ExternalLinkButton,
} from '../../design-system'
import {
  PRIVACY_NOTES,
  SOURCE_CODE_URL,
  ABOUT_INTRO,
  ABOUT_SIGN_OFF,
  ABOUT_TITLE,
} from './privacyNotes'
import styles from './PrivacyNotice.module.css'

type PrivacyNoticeProps = {
  isOpen: boolean
  onClose: () => void
}

/**
 * About: the author's note on what this is, then how your data is kept, with
 * a link to the source code.
 */
export function PrivacyNotice({ isOpen, onClose }: PrivacyNoticeProps) {
  return (
    <Dialog
      isOpen={isOpen}
      title={ABOUT_TITLE}
      onClose={onClose}
      actions={
        <>
          <ExternalLinkButton href={SOURCE_CODE_URL}>
            <BrandIcon icon={siGithub} />
            GitHub
          </ExternalLinkButton>
          <Button variant="subtle" onClick={onClose}>
            {ABOUT_SIGN_OFF}
          </Button>
        </>
      }
    >
      <p>{ABOUT_INTRO}</p>
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
