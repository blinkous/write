import { Button, MessagePage, MessageTitle, Text } from '../../design-system'

function openInOwnTab() {
  window.open(window.location.href, '_blank', 'noopener,noreferrer')
}

/** Shown instead of the app when another page frames it (see `isFramed`). */
export function FramedNotice() {
  return (
    <MessagePage>
      <MessageTitle>Write opens in its own tab</MessageTitle>
      <Text>
        To keep your writing safe, Write doesn’t run inside other pages. Open it
        directly at {window.location.host}.
      </Text>
      <Button variant="subtle" onClick={openInOwnTab}>
        Open in a new tab
      </Button>
    </MessagePage>
  )
}
