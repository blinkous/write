import {
  MessagePage,
  MessageTitle,
  ReloadButton,
  Text,
} from '../../design-system'

/**
 * Shown instead of the app when the journal's storage (IndexedDB) won't open
 * after the entries moved there: the old localStorage copy would hide newer
 * writing, so nothing is shown or saved until a reload works.
 */
export function JournalUnavailable() {
  return (
    <MessagePage>
      <MessageTitle tone="warning">Your journal couldn’t open</MessageTitle>
      <Text>
        This browser’s storage isn’t responding. Your writing is still stored
        here; reload to try again.
      </Text>
      <ReloadButton />
    </MessagePage>
  )
}
