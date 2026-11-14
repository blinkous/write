import { Button, MessageTitle, Text } from '../../design-system'
import styles from './JournalUnavailable.module.css'

/**
 * Shown instead of the app when the journal's storage (IndexedDB) won't open
 * after the entries moved there: the old localStorage copy would hide newer
 * writing, so nothing is shown or saved until a reload works.
 */
export function JournalUnavailable() {
  return (
    <main className={styles.page}>
      <h1 className="visually-hidden">Write</h1>
      <MessageTitle tone="warning">Your journal couldn’t open</MessageTitle>
      <Text>
        This browser’s storage isn’t responding. Your writing is still stored
        here; reload to try again.
      </Text>
      <Button variant="subtle" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </main>
  )
}
