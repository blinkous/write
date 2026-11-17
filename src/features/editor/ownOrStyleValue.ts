import { useEditorState, type Editor } from '@tiptap/react'
import type { TextStyles, TextStyleSettings } from '../../text-styles'
import { getTextStyleNameAt } from './textStyles'

/** Which editor's text a toolbar control acts on, and how each text style looks. */
export type TextStyleContext = {
  /** Whether the editor is the entry's title, whose text style is Title. */
  isTitle: boolean
  textStyles: TextStyles
}

/**
 * A toolbar control's value at the cursor: the text's own (null when it has
 * none) and its text style's, so the control can show the one in effect.
 */
export function useOwnAndStyleValue<Key extends keyof TextStyleSettings, Own>(
  editor: Editor,
  { isTitle, textStyles }: TextStyleContext,
  styleKey: Key,
  readOwn: (editor: Editor) => Own | null,
): { own: Own | null; style: TextStyleSettings[Key] } {
  return useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      own: readOwn(currentEditor),
      style: textStyles[getTextStyleNameAt(currentEditor, isTitle)][styleKey],
    }),
  })
}

/**
 * Every toolbar menu's rule: choosing what the text's style already gives
 * removes the text's own value, so it follows its style again; anything else
 * becomes its own.
 */
export function chooseOwnValue<Value>(
  chosen: Value,
  styleValue: Value,
  { set, unset }: { set: (value: Value) => void; unset: () => void },
) {
  if (chosen === styleValue) unset()
  else set(chosen)
}
