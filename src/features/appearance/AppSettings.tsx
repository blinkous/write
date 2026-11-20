import { LabeledRow } from '../../design-system'
import { FontMenu } from '../../fonts'
import type { CustomThemePack } from './customThemePacks'
import type { useCustomThemePacks } from './useCustomThemePacks'
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
  /** Looks saved as theme packs, with their backgrounds. */
  customThemePacks: readonly CustomThemePack[]
  /** Choosing, saving, updating and deleting packs, curated ones included. */
  packActions: ReturnType<typeof useCustomThemePacks>
}

/** The theme packs, then everything around the page: its font and the page's foreground and background. */
export function AppSettings({
  pageTheme,
  backgroundMedia,
  customThemePacks,
  packActions,
  ...customColorProps
}: AppSettingsProps) {
  const { appFont, changeFonts } = pageTheme
  return (
    <>
      <ThemePackPicker
        customPacks={customThemePacks}
        packActions={packActions}
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
    </>
  )
}
