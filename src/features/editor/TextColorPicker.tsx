import type { Editor } from '@tiptap/react'
import { resolveTextColor, THEME_TEXT_COLORS } from '../../journal-document'
import { TextColorMenu } from '../../text-styles'
import {
  chooseOwnValue,
  useOwnAndStyleValue,
  type TextStyleContext,
} from './ownOrStyleValue'

/** The theme color that is the page text color, stored where the text's style has another. */
const [PAGE_TEXT_THEME_COLOR] = THEME_TEXT_COLORS

type TextColorPickerProps = TextStyleContext & {
  editor: Editor
  /** Shown as the starting color when filling an empty custom slot. */
  pageTextColor: string
  customTextColors: readonly (string | null)[]
  onCustomTextColorsChange: (customTextColors: (string | null)[]) => void
}

/**
 * Colors the selected text, or the text about to be typed. Theme colors are
 * live shades of the page background; custom colors are user-filled slots.
 * It shows the text's own color, or its style's. Choosing the style's color
 * removes the text's own (see chooseOwnValue); the first tile is the page text color.
 */
export function TextColorPicker({
  editor,
  pageTextColor,
  customTextColors,
  onCustomTextColorsChange,
  ...textStyleContext
}: TextColorPickerProps) {
  const { own, style } = useOwnAndStyleValue(
    editor,
    textStyleContext,
    'color',
    (currentEditor): string | null => {
      const { color } = currentEditor.getAttributes('textStyle')
      return resolveTextColor(color) === null ? null : color
    },
  )

  /* Null is the page text color. */
  function applyColor(color: string | null) {
    chooseOwnValue(color, style, {
      set: (ownColor) =>
        editor
          .chain()
          .setColor(ownColor ?? PAGE_TEXT_THEME_COLOR)
          .run(),
      unset: () => editor.chain().unsetColor().run(),
    })
  }

  return (
    <TextColorMenu
      label="Text color"
      value={own ?? style}
      pageTextColor={pageTextColor}
      customColors={customTextColors}
      onCustomColorsChange={onCustomTextColorsChange}
      onSelect={applyColor}
      // Live while dragging in the system picker, so the text previews the color.
      onPick={applyColor}
      // Return to the text with its selection, so typing continues in the chosen color.
      onClose={() => editor.commands.focus()}
    />
  )
}
