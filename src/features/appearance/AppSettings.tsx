import { useId, type ReactNode } from 'react'
import { LabeledRow, TextInput } from '../../design-system'
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
  const { appFont, changeFonts, tabTitle, changeTabTitle, commit } = pageTheme
  const tabTitleInputId = useId()
  return (
    <>
      <LabeledRow label="Tab title" controlId={tabTitleInputId} control="field">
        <TextInput
          id={tabTitleInputId}
          value={tabTitle}
          placeholder={APP_NAME}
          maxLength={TAB_TITLE_MAX_LENGTH}
          spellCheck={false}
          autoComplete="off"
          onChange={({ target }) => changeTabTitle(target.value)}
          onBlur={commit}
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
