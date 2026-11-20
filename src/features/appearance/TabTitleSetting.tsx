import { AppWindow } from 'lucide-react'
import { EditableText, LabeledRow } from '../../design-system'
import { APP_NAME, TAB_TITLE_MAX_LENGTH } from './appearanceOptions'
import type { usePageTheme } from './usePageTheme'

/**
 * The browser tab's title ("Write" while empty). Typed in place; part of the
 * settings' undo history.
 */
export function TabTitleSetting({
  pageTheme,
}: {
  pageTheme: ReturnType<typeof usePageTheme>
}) {
  const { tabTitle, changeTabTitle } = pageTheme
  return (
    <LabeledRow label="Tab title" control="text" icon={AppWindow}>
      <EditableText
        label="Tab title"
        value={tabTitle}
        placeholder={APP_NAME}
        maxLength={TAB_TITLE_MAX_LENGTH}
        onChange={(nextTabTitle) => changeTabTitle(nextTabTitle)}
        onEditEnd={(finalTabTitle) => changeTabTitle(finalTabTitle, true)}
      />
    </LabeledRow>
  )
}
