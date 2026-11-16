import type { FallbackProps } from 'react-error-boundary'
import { MessagePage, MessageTitle, ReloadButton, Text } from '../design-system'

/**
 * Shown in place of the app when it crashes while drawing (an error boundary
 * around it), instead of a blank page. Writing is saved as it's typed, so a
 * reload loses nothing. The error's own message is shown for reporting.
 */
export function AppCrashed({ error }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  return (
    <MessagePage>
      <MessageTitle tone="warning">Something went wrong</MessageTitle>
      <Text>
        Write stopped working. Your writing is saved; reload to carry on.
      </Text>
      <Text variant="caption">{errorMessage}</Text>
      <ReloadButton />
    </MessagePage>
  )
}
