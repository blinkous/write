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
    <LabeledRow label="Default font" control="button">
      <FontMenu
        label="Default font"
        value={editorFont}
        onChange={(nextFont) =>
          nextFont && changeFonts({ editorFont: nextFont })
        }
      />
    </LabeledRow>
  )
}
