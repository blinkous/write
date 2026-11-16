import { Button } from './Button'

/** Reloads the page: the way out of a message shown in place of the app. */
export function ReloadButton() {
  return (
    <Button variant="subtle" onClick={() => window.location.reload()}>
      Reload
    </Button>
  )
}
