import { useEditorState, type Editor } from '@tiptap/react'
import { resolveTextColor } from '../../journal-document'
import { GlowColorMenu } from '../../text-styles'

type TextGlowPickerProps = {
  editor: Editor
  /** Shown as the starting color when filling an empty custom slot. */
  pageTextColor: string
  customTextColors: readonly (string | null)[]
  onCustomTextColorsChange: (customTextColors: (string | null)[]) => void
}

/**
 * Gives the selected text, or the text about to be typed, a glow in its own
 * color, separate from the text color. The first tile, No glow, removes the
 * text's own glow, so it also serves as reset.
 */
export function TextGlowPicker({
  editor,
  pageTextColor,
  customTextColors,
  onCustomTextColorsChange,
}: TextGlowPickerProps) {
  const textGlow = useEditorState({
    editor,
    selector: ({ editor: currentEditor }): string | null => {
      const { glow } = currentEditor.getAttributes('textStyle')
      return resolveTextColor(glow) === null ? null : glow
    },
  })

  function applyGlow(glow: string | null) {
    if (glow) editor.chain().setTextGlow(glow).run()
    else editor.chain().unsetTextGlow().run()
  }

  return (
    <GlowColorMenu
      label="Text glow"
      value={textGlow}
      pageTextColor={pageTextColor}
      customColors={customTextColors}
      onCustomColorsChange={onCustomTextColorsChange}
      onSelect={applyGlow}
      // Live while dragging in the system picker, so the text previews the glow.
      onPick={applyGlow}
      // Return to the text with its selection, so typing continues with the chosen glow.
      onClose={() => editor.commands.focus()}
    />
  )
}
