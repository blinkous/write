import { LabeledRow } from '../../design-system'
import { FontMenu } from '../../fonts'
import { PageColorSettings } from './ThemeSettings'
import type { usePageTheme } from './usePageTheme'

/** Everything around the page: its font, and the page's background and text colors. */
export function AppSettings({
  pageTheme,
}: {
  pageTheme: ReturnType<typeof usePageTheme>
}) {
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
      <PageColorSettings pageTheme={pageTheme} />
    </>
  )
}
