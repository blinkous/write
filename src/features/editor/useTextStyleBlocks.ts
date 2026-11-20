import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Editor } from '@tiptap/react'
import { useEffect, useEffectEvent } from 'react'
import { EMPHASES } from '../../journal-document'
import {
  TEXT_STYLE_NAMES,
  type TextStyleName,
  type TextStyles,
} from '../../text-styles'
import { shareTextStylesWithShortcuts } from './editorShortcuts'
import { getBlockTextStyleName } from './textStyles'

/**
 * Gives an editor's blocks their text style's case and emphasis, which the
 * editor applies itself: title and sentence case capitalize the right letters
 * (CSS can't), and bold, italic, underline and strikethrough follow what text
 * turns off. The title editor's text is all Title; the writing's follows each
 * paragraph. Also tells the editor's shortcuts the current styles.
 */
export function useTextStyleBlocks(
  editor: Editor,
  textStyles: TextStyles,
  isTitle: boolean,
) {
  // Only cases and emphasis matter: other style changes (size, color) don't redraw.
  const blocksKey = TEXT_STYLE_NAMES.map((name) => {
    const settings = textStyles[name]
    return [
      settings.textCase,
      ...EMPHASES.map((emphasis) => settings[emphasis]),
    ]
  }).join()

  const applyStyles = useEffectEvent(() => {
    const getStyleName = (block: ProseMirrorNode): TextStyleName | null =>
      isTitle ? 'title' : getBlockTextStyleName(block)
    editor
      .chain()
      .setBlockTextCases((block) => {
        const styleName = getStyleName(block)
        return styleName ? textStyles[styleName].textCase : null
      })
      .setBlockEmphasis((block) => {
        const styleName = getStyleName(block)
        if (!styleName) return null
        const { bold, italic, underline, strike } = textStyles[styleName]
        return { bold, italic, underline, strike }
      })
      .run()
  })

  useEffect(() => {
    if (!editor.isDestroyed) applyStyles()
  }, [editor, isTitle, blocksKey])

  // Shortcuts that follow the styles (alignment) read them from the editor.
  useEffect(
    () => shareTextStylesWithShortcuts(editor, textStyles),
    [editor, textStyles],
  )
}
