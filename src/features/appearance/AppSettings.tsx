import { LabeledRow } from '../../design-system'
import { FontMenu } from '../../fonts'
import { SidebarBorderSetting } from './SidebarBorderSetting'
import { PageColorSettings } from './ThemeSettings'
import { ThemePackPicker } from './ThemePackPicker'
import type { useBackgroundMedia } from './useBackgroundMedia'
import type { usePageTheme } from './usePageTheme'

type AppSettingsProps = {
  pageTheme: ReturnType<typeof usePageTheme>
  backgroundMedia: ReturnType<typeof useBackgroundMedia>
  /** The custom color slots shared by every color menu. */
  customColors: readonly (string | null)[]
  onCustomColorsChange: (customColors: (string | null)[]) => void
}

/** The theme packs, then everything around the page: its font, the page's foreground and background, and the sidebar border. */
export function AppSettings({
  pageTheme,
  backgroundMedia,
  ...customColorProps
}: AppSettingsProps) {
  const {
    appFont,
    editorFont,
    backgroundColor,
    textColor,
    textStyles,
    changeFonts,
    applyThemeLook,
  } = pageTheme
  return (
    <>
      <ThemePackPicker
        current={{
          appFont,
          editorFont,
          backgroundColor,
          textColor,
          textStyles,
        }}
        onSelect={applyThemeLook}
      />
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
        {...customColorProps}
      />
      <SidebarBorderSetting pageTheme={pageTheme} />
    </>
  )
}
