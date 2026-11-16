import { useRef } from 'react'
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
  WELCOME_INTRO,
  WELCOME_SIGN_OFF,
  WELCOME_TITLE,
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
  // Focus the sign-off, not the GitHub link before it, so Enter closes the dialog.
  const signOffButtonRef = useRef<HTMLButtonElement>(null)
  return (
    <Dialog
      isOpen={isOpen}
      title={WELCOME_TITLE}
      onClose={onClose}
      initialFocusRef={signOffButtonRef}
      actions={
        <>
          <ExternalLinkButton href={SOURCE_CODE_URL}>
            <BrandIcon icon={siGithub} />
            GitHub
          </ExternalLinkButton>
          <Button variant="subtle" onClick={onClose} ref={signOffButtonRef}>
            {WELCOME_SIGN_OFF}
          </Button>
        </>
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
