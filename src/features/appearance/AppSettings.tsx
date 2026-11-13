import type { ReactNode } from 'react'
import { EditableText, LabeledRow } from '../../design-system'
import { FontMenu } from '../../fonts'
import { APP_NAME, TAB_TITLE_MAX_LENGTH } from './appearanceOptions'
import { PageColorSettings } from './ThemeSettings'
import type { usePageTheme } from './usePageTheme'

type AppSettingsProps = {
  pageTheme: ReturnType<typeof usePageTheme>
  /** More of the look around the page, after the colors (e.g. the background media). */
  children?: ReactNode
}

/** Everything around the page: the tab's title, its font, and the page's background and text colors. */
export function AppSettings({ pageTheme, children }: AppSettingsProps) {
  const { appFont, changeFonts, tabTitle, changeTabTitle } = pageTheme
  return (
    <>
      <LabeledRow label="Tab title" control="text">
        <EditableText
          label="Tab title"
          value={tabTitle}
          placeholder={APP_NAME}
          maxLength={TAB_TITLE_MAX_LENGTH}
          onChange={(nextTabTitle) => changeTabTitle(nextTabTitle)}
          onEditEnd={(finalTabTitle) => changeTabTitle(finalTabTitle, true)}
        />
      </LabeledRow>
      <LabeledRow label="Font" control="button">
        <FontMenu
          label="App font"
          value={appFont}
          onChange={(nextFont) =>
            nextFont && changeFonts({ appFont: nextFont })
          }
        />
      </LabeledRow>
      <PageColorSettings pageTheme={pageTheme} />
      {children}
    </>
  )
}
