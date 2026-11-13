import { useEditorState, type Editor } from '@tiptap/react'
import { resolveTextColor } from '../../journal-document'
import { TextColorMenu } from '../../text-styles'

type TextColorPickerProps = {
  editor: Editor
  /** Shown as the starting color when filling an empty custom slot. */
  pageTextColor: string
  customTextColors: readonly (string | null)[]
  onCustomTextColorsChange: (customTextColors: (string | null)[]) => void
}

/**
 * Colors the selected text, or the text about to be typed. Theme colors are
 * live shades of the page background; custom colors are user-filled slots.
 * The first theme tile is the page text color: choosing it removes the text's
 * own color, so it also serves as reset.
 */
export function TextColorPicker({
  editor,
  pageTextColor,
  customTextColors,
  onCustomTextColorsChange,
}: TextColorPickerProps) {
  const textColor = useEditorState({
    editor,
    selector: ({ editor: currentEditor }): string | null => {
      const { color } = currentEditor.getAttributes('textStyle')
      return resolveTextColor(color) === null ? null : color
    },
  })

  function applyColor(color: string | null) {
    if (color) editor.chain().setColor(color).run()
    else editor.chain().unsetColor().run()
  }

  return (
    <TextColorMenu
      label="Text color"
      value={textColor}
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
