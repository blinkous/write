import type { Editor } from '@tiptap/react'
import { NO_GLOW } from '../../journal-document'
import { GlowColorMenu } from './GlowColorMenu'
import {
  chooseOwnValue,
  useOwnAndStyleValue,
  type TextStyleContext,
} from './ownOrStyleValue'
import { readOwnGlow } from './ownFormatting'

type TextGlowPickerProps = TextStyleContext & {
  editor: Editor
  /** The theme's shades as #rrggbb(aa), the page text color first, for the picker. */
  themeColors: readonly string[]
  customTextColors: readonly (string | null)[]
  onCustomTextColorsChange: (customTextColors: (string | null)[]) => void
}

/**
 * Gives the selected text, or the text about to be typed, a glow in its own
 * color, separate from the text color. It shows the text's own glow, or its
 * style's; choosing the style's removes the text's own (see chooseOwnValue).
 */
export function TextGlowPicker({
  editor,
  themeColors,
  customTextColors,
  onCustomTextColorsChange,
  ...textStyleContext
}: TextGlowPickerProps) {
  const { own, style } = useOwnAndStyleValue(
    editor,
    textStyleContext,
    'glow',
    readOwnGlow,
  )

  /* Null is no glow. */
  function applyGlow(glow: string | null) {
    chooseOwnValue(glow, style, {
      set: (ownGlow) =>
        editor
          .chain()
          .setTextGlow(ownGlow ?? NO_GLOW)
          .run(),
      unset: () => editor.chain().unsetTextGlow().run(),
    })
  }

  return (
    <GlowColorMenu
      label="Text glow"
      value={own === NO_GLOW ? null : (own ?? style)}
      themeColors={themeColors}
      customColors={customTextColors}
      onCustomColorsChange={onCustomTextColorsChange}
      onSelect={applyGlow}
      // Live while dragging in the picker, so the text previews the glow.
      onPick={applyGlow}
      // Return to the text with its selection, so typing continues with the chosen glow.
      onClose={() => editor.commands.focus()}
    />
  )
}
