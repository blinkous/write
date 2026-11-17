import type { Editor } from '@tiptap/react'
import { useEffect, useEffectEvent } from 'react'
import { TEXT_STYLE_NAMES, type TextStyles } from '../../text-styles'
import { getBlockTextStyleName } from './textStyles'

/**
 * Gives an editor's blocks the case of their text style (settings → Editor),
 * so title and sentence case capitalize the right letters (CSS can't). The
 * title editor's text is all Title; the writing's follows each paragraph.
 */
export function useTextStyleCases(
  editor: Editor,
  textStyles: TextStyles,
  isTitle: boolean,
) {
  // Only the cases matter: other style changes don't redraw the capitals.
  const casesKey = TEXT_STYLE_NAMES.map(
    (name) => textStyles[name].textCase,
  ).join()

  const applyCases = useEffectEvent(() =>
    editor.commands.setBlockTextCases((block) => {
      const styleName = isTitle ? 'title' : getBlockTextStyleName(block)
      return styleName ? textStyles[styleName].textCase : null
    }),
  )

  useEffect(() => {
    if (!editor.isDestroyed) applyCases()
  }, [editor, isTitle, casesKey])
}
