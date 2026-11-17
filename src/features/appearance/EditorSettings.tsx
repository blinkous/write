import { useRef } from 'react'
import { LabeledRow, ResetMenuItem } from '../../design-system'
import { FontMenu } from '../../fonts'
import { DEFAULT_TEXT_STYLES } from '../../text-styles'
import type { usePageTheme } from './usePageTheme'
import styles from './EditorSettings.module.css'

/**
 * The editor's default font (every text style's base), and a reset for every
 * text style at once (each also has its own, in the style menu).
 */
export function EditorSettings({
  pageTheme,
}: {
  pageTheme: ReturnType<typeof usePageTheme>
}) {
  const { editorFont, textStyles, changeFonts, resetTextStyles } = pageTheme
  const rowsRef = useRef<HTMLDivElement>(null)
  const isAllDefault =
    JSON.stringify(textStyles) === JSON.stringify(DEFAULT_TEXT_STYLES)
  return (
    <div ref={rowsRef} className={styles.rows}>
      <LabeledRow label="Default font" control="button">
        <FontMenu
          label="Default font"
          value={editorFont}
          onChange={(nextFont) =>
            nextFont && changeFonts({ editorFont: nextFont })
          }
        />
      </LabeledRow>
      <ResetMenuItem
        label="Reset text styles"
        canReset={!isAllDefault}
        onReset={resetTextStyles}
        // The reset turns off once used, so focus moves to the section's first control.
        refocus={() => rowsRef.current?.querySelector('button')?.focus()}
      />
    </div>
  )
}
