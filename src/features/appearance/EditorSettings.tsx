import { Button, LabeledRow } from '../../design-system'
import { FontMenu } from '../../fonts'
import { DEFAULT_TEXT_STYLES } from '../../text-styles'
import type { usePageTheme } from './usePageTheme'
import styles from './EditorSettings.module.css'

/**
 * The editor's font (every text style's default) and one reset for it and
 * every style. The styles themselves are edited from the toolbar's style menu
 * (its ⋯ options: update to match the text, size, reset).
 */
export function EditorSettings({
  pageTheme,
}: {
  pageTheme: ReturnType<typeof usePageTheme>
}) {
  const { appFont, editorFont, textStyles, changeFonts, resetEditor } =
    pageTheme
  const isAllDefault =
    editorFont === appFont &&
    JSON.stringify(textStyles) === JSON.stringify(DEFAULT_TEXT_STYLES)
  return (
    <>
      <LabeledRow label="Font" control="button">
        <FontMenu
          label="Editor font"
          value={editorFont}
          onChange={(nextFont) =>
            nextFont && changeFonts({ editorFont: nextFont })
          }
        />
      </LabeledRow>
      <Button
        variant="ghost"
        className={styles.reset}
        disabled={isAllDefault}
        onClick={resetEditor}
      >
        Reset all styles
      </Button>
    </>
  )
}
