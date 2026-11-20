import { useRef } from 'react'
import { LabeledRow, ResetMenuItem } from '../../design-system'
import { FontMenu } from '../../fonts'
import type { usePageTheme } from './usePageTheme'
import styles from './EditorSettings.module.css'

/**
 * The editor's default font (every text style's base), and a reset for every
 * text style at once, back to the chosen theme pack's (each also has its own,
 * in the style menu).
 */
export function EditorSettings({
  pageTheme,
}: {
  pageTheme: ReturnType<typeof usePageTheme>
}) {
  const { editorFont, changeFonts, canResetTextStyles, resetTextStyles } =
    pageTheme
  const rowsRef = useRef<HTMLDivElement>(null)
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
        canReset={canResetTextStyles}
        onReset={resetTextStyles}
        // The reset turns off once used, so focus moves to the section's first control.
        refocus={() => rowsRef.current?.querySelector('button')?.focus()}
      />
    </div>
  )
}
