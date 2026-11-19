import { Switch } from '../../design-system'
import type { usePageTheme } from './usePageTheme'

/**
 * Shows or hides the border between the sidebar and the page (e.g. so a
 * background picture runs unbroken); one undo step.
 */
export function SidebarBorderSetting({
  pageTheme: { hasSidebarBorder, changeSidebarBorder },
}: {
  pageTheme: ReturnType<typeof usePageTheme>
}) {
  return (
    <Switch
      label="Sidebar border"
      checked={hasSidebarBorder}
      onChange={({ target }) => changeSidebarBorder(target.checked)}
    />
  )
}
