import { EditableText, LabeledRow } from '../../design-system'
import { FontMenu } from '../../fonts'
import { APP_NAME, TAB_TITLE_MAX_LENGTH } from './appearanceOptions'
import { PageColorSettings } from './ThemeSettings'
import type { useBackgroundMedia } from './useBackgroundMedia'
import type { usePageTheme } from './usePageTheme'

type AppSettingsProps = {
  pageTheme: ReturnType<typeof usePageTheme>
  backgroundMedia: ReturnType<typeof useBackgroundMedia>
}

/** Everything around the page: the tab's title, its font, and the page's foreground and background. */
export function AppSettings({ pageTheme, backgroundMedia }: AppSettingsProps) {
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
      <PageColorSettings
        pageTheme={pageTheme}
        backgroundMedia={backgroundMedia}
      />
    </>
  )
}
