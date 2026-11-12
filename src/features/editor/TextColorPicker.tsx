import { useEditorState, type Editor } from '@tiptap/react'
import { Baseline } from 'lucide-react'
import {
  Popover,
  PopoverPanel,
  SwatchButton,
  SwatchColorInput,
  SwatchRow,
} from '../../design-system'
import {
  getThemeColorToken,
  resolveTextColor,
  THEME_TEXT_COLORS,
} from '../../journal-document'

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

  function applyColor(color: string) {
    editor.chain().setColor(color).run()
  }

  function setCustomSlot(slotIndex: number, color: string | null) {
    onCustomTextColorsChange(
      customTextColors.map((slotColor, index) =>
        index === slotIndex ? color : slotColor,
      ),
    )
  }

  function fillCustomSlot(slotIndex: number, color: string) {
    setCustomSlot(slotIndex, color)
    applyColor(color)
  }

  return (
    <Popover
      label="Text color"
      trigger={
        <Baseline
          aria-hidden="true"
          style={{ color: resolveTextColor(textColor) ?? undefined }}
        />
      }
      // Return to the text with its selection, so typing continues in the chosen color.
      onClose={() => editor.commands.focus()}
    >
      {(close) => (
        <PopoverPanel>
          <SwatchRow label="Theme colors">
            {THEME_TEXT_COLORS.map((themeColor, index) => {
              // The first tile is the page text color: choosing it removes the
              // text's own color (the "reset"), and it's selected by default.
              const isPageTextColor = index === 0
              return (
                <SwatchButton
                  key={themeColor}
                  color={getThemeColorToken(themeColor)}
                  label={
                    isPageTextColor
                      ? 'Page text color'
                      : `Theme color ${index + 1}`
                  }
                  isSelected={
                    isPageTextColor
                      ? textColor === null || textColor === themeColor
                      : textColor === themeColor
                  }
                  onClick={() => {
                    if (isPageTextColor) editor.chain().unsetColor().run()
                    else applyColor(themeColor)
                    close()
                  }}
                />
              )
            })}
          </SwatchRow>
          <SwatchRow label="Custom colors">
            {customTextColors.map((slotColor, index) => (
              <SwatchColorInput
                // Slots are fixed positions, so the index is a stable key.
                key={index}
                value={slotColor}
                label={`Custom color ${index + 1}${slotColor ? '' : ', empty'}`}
                isSelected={slotColor !== null && textColor === slotColor}
                emptyPickerColor={pageTextColor}
                onClick={() => {
                  if (slotColor) applyColor(slotColor)
                }}
                onChange={(color) => fillCustomSlot(index, color)}
                onClear={() => setCustomSlot(index, null)}
              />
            ))}
          </SwatchRow>
        </PopoverPanel>
      )}
    </Popover>
  )
}
