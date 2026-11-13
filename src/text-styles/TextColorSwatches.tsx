import { SwatchButton, SwatchColorInput, SwatchRow } from '../design-system'
import { getThemeColorToken, THEME_TEXT_COLORS } from '../journal-document'

type TextColorSwatchesProps = {
  /** The chosen color (theme color name or #rrggbb), or null for the page text color. */
  value: string | null
  /** Shown as the starting color when filling an empty custom slot. */
  pageTextColor: string
  customColors: readonly (string | null)[]
  onCustomColorsChange: (customColors: (string | null)[]) => void
  /** A color was chosen by clicking a tile; null is the page text color. */
  onSelect: (color: string | null) => void
  /** A custom slot is being filled from the system picker (every step of a drag). */
  onPick: (color: string) => void
  /** The system picker closed on a color: the drag is over. */
  onPickEnd?: () => void
}

/**
 * Text color choices: theme colors (live shades of the page background; the
 * first is the page text color itself, so it also serves as reset) and the
 * person's custom color slots. Used for text (toolbar) and text styles (settings).
 */
export function TextColorSwatches({
  value,
  pageTextColor,
  customColors,
  onCustomColorsChange,
  onSelect,
  onPick,
  onPickEnd,
}: TextColorSwatchesProps) {
  function setCustomSlot(slotIndex: number, color: string | null) {
    onCustomColorsChange(
      customColors.map((slotColor, index) =>
        index === slotIndex ? color : slotColor,
      ),
    )
  }

  return (
    <>
      <SwatchRow label="Theme colors">
        {THEME_TEXT_COLORS.map((themeColor, index) => {
          const isPageTextColor = index === 0
          return (
            <SwatchButton
              key={themeColor}
              color={getThemeColorToken(themeColor)}
              label={
                isPageTextColor ? 'Page text color' : `Theme color ${index + 1}`
              }
              isSelected={
                isPageTextColor
                  ? value === null || value === themeColor
                  : value === themeColor
              }
              onClick={() => onSelect(isPageTextColor ? null : themeColor)}
            />
          )
        })}
      </SwatchRow>
      <SwatchRow label="Custom colors">
        {customColors.map((slotColor, index) => (
          <SwatchColorInput
            // Slots are fixed positions, so the index is a stable key.
            key={index}
            value={slotColor}
            label={`Custom color ${index + 1}${slotColor ? '' : ', empty'}`}
            isSelected={slotColor !== null && value === slotColor}
            emptyPickerColor={pageTextColor}
            onClick={() => {
              if (slotColor) onSelect(slotColor)
            }}
            onChange={(color) => {
              setCustomSlot(index, color)
              onPick(color)
            }}
            onCommit={onPickEnd}
            onClear={() => setCustomSlot(index, null)}
          />
        ))}
      </SwatchRow>
    </>
  )
}
