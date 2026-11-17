import { LabeledRow } from '../../design-system'
import { FontMenu } from '../../fonts'
import type { usePageTheme } from './usePageTheme'

/**
 * The editor's font, every text style's default. The styles themselves are
 * set from the toolbar's style menu, each with its own reset.
 */
export function EditorSettings({
  pageTheme,
}: {
  pageTheme: ReturnType<typeof usePageTheme>
}) {
  const { editorFont, changeFonts } = pageTheme
  return (
    <LabeledRow label="Font" control="button">
      <FontMenu
        label="Editor font"
        value={editorFont}
        onChange={(nextFont) =>
          nextFont && changeFonts({ editorFont: nextFont })
        }
      />
    </LabeledRow>
  )
}
