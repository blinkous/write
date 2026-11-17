import { LabeledRow } from '../../design-system'
import { FontMenu } from '../../fonts'
import { PageColorSettings } from './ThemeSettings'
import type { useBackgroundMedia } from './useBackgroundMedia'
import type { usePageTheme } from './usePageTheme'

type AppSettingsProps = {
  pageTheme: ReturnType<typeof usePageTheme>
  backgroundMedia: ReturnType<typeof useBackgroundMedia>
}

/** Everything around the page: its font, and the page's foreground and background. */
export function AppSettings({ pageTheme, backgroundMedia }: AppSettingsProps) {
  const { appFont, changeFonts } = pageTheme
  return (
    <>
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
