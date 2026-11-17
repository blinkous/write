import type { ReactNode } from 'react'
import { Popover } from './Popover'
import { PopoverPanel } from './PopoverPanel'
import { SwatchButton, SwatchColorInput, SwatchRow } from './Swatch'

export type ColorSuggestion = {
  /** Any CSS color, including a design token like var(--color-theme-1); null is "no color" (e.g. no glow). */
  color: string | null
  label: string
  isSelected: boolean
  onSelect: () => void
}

type ColorMenuProps = {
  /** Names the trigger and the menu, e.g. "Text color" or "Title color". */
  label: string
  /** The trigger's icon, e.g. one showing the current color. */
  trigger: ReactNode
  /** The first row: ready-made colors for this use (e.g. theme tones). */
  suggestions: readonly ColorSuggestion[]
  suggestionsLabel: string
  /** The current color, so a custom slot holding it shows as chosen. */
  value: string | null
  /** The person's own colors, shared by every text color menu; null is an empty slot. */
  customColors: readonly (string | null)[]
  onCustomColorsChange: (customColors: (string | null)[]) => void
  /** Where the system picker starts when filling an empty slot. */
  emptyPickerColor: string
  /** A filled custom slot was pressed (the menu closes). */
  onSelectCustom: (color: string) => void
  /** A custom slot is being filled (every step of a drag in the system picker). */
  onPick: (color: string) => void
  /** The system picker closed on a color: the drag is over. */
  onPickEnd?: () => void
  onClose?: () => void
}

/**
 * A color menu (text colors, glows): suggested tiles, then the person's custom
 * slots (an empty one opens the system picker; a filled one is chosen and the
 * picker opens to change it). A filled slot's × empties it, shown on hover
 * or focus.
 */
export function ColorMenu({
  label,
  trigger,
  suggestions,
  suggestionsLabel,
  value,
  customColors,
  onCustomColorsChange,
  emptyPickerColor,
  onSelectCustom,
  onPick,
  onPickEnd,
  onClose,
}: ColorMenuProps) {
  function setCustomSlot(slotIndex: number, color: string | null) {
    onCustomColorsChange(
      customColors.map((slotColor, index) =>
        index === slotIndex ? color : slotColor,
      ),
    )
  }

  return (
    <Popover label={label} trigger={trigger} onClose={onClose}>
      {(close) => (
        <PopoverPanel>
          <SwatchRow label={suggestionsLabel}>
            {suggestions.map(
              ({ color, label: suggestionLabel, isSelected, onSelect }) => (
                <SwatchButton
                  key={suggestionLabel}
                  color={color}
                  label={suggestionLabel}
                  isSelected={isSelected}
                  onClick={() => {
                    onSelect()
                    close()
                  }}
                />
              ),
            )}
          </SwatchRow>
          <SwatchRow label="Custom colors">
            {customColors.map((slotColor, index) => (
              <SwatchColorInput
                // Slots are fixed positions, so the index is a stable key.
                key={index}
                value={slotColor}
                label={`Custom color ${index + 1}${slotColor ? '' : ', empty'}`}
                isSelected={slotColor !== null && value === slotColor}
                emptyPickerColor={emptyPickerColor}
                onClick={() => {
                  if (!slotColor) return
                  onSelectCustom(slotColor)
                  close()
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
        </PopoverPanel>
      )}
    </Popover>
  )
}
