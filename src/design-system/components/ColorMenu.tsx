import type { ReactNode } from 'react'
import { removeTransparency } from '../../utils/color'
import { ColorPicker } from './ColorPicker'
import { Popover } from './Popover'
import { PopoverPanel } from './PopoverPanel'
import { SwatchButton, SwatchRow, SwatchSlot } from './Swatch'

export type ColorSuggestion = {
  /** Any CSS color, including a design token like var(--color-theme-1); null is "no color" (e.g. no glow). */
  color: string | null
  label: string
  isSelected: boolean
  onSelect: () => void
}

type ColorMenuProps = {
  /** Names the trigger, the menu and its picker, e.g. "Text color" or "Background color". */
  label: string
  /** The trigger's icon, e.g. one showing the current color. */
  trigger: ReactNode
  /** The first row: ready-made colors for this use (e.g. theme tones). */
  suggestions: readonly ColorSuggestion[]
  suggestionsLabel: string
  /** The current color as stored, so a custom slot holding it shows as chosen. */
  value: string | null
  /** The current color as #rrggbb(aa), for the picker (e.g. a theme color's shade). */
  pickerColor: string
  /** Off where nothing shows through (the page background): no opacity slider, and custom colors are used opaque. */
  allowsTransparency: boolean
  /** The person's own colors, shared by every color menu; null is an empty slot. */
  customColors: readonly (string | null)[]
  onCustomColorsChange: (customColors: (string | null)[]) => void
  /** A filled custom slot was pressed. */
  onSelectCustom: (color: string) => void
  /** The picker changed the color (every step of a drag). */
  onPick: (color: string) => void
  /** A pick is done (a drag let go, a typed or dropped color): one undo step. */
  onPickEnd?: () => void
  onClose?: () => void
}

/**
 * A color menu: suggested tiles, the person's custom slots, then the picker,
 * always shown. Choosing stays in the menu, so a choice can be fine-tuned in
 * the picker. An empty slot saves the current color; a filled one is chosen,
 * and its × (shown on hover or focus) empties it.
 */
export function ColorMenu({
  label,
  trigger,
  suggestions,
  suggestionsLabel,
  value,
  pickerColor,
  allowsTransparency,
  customColors,
  onCustomColorsChange,
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
      <PopoverPanel>
        <SwatchRow label={suggestionsLabel}>
          {suggestions.map(
            ({ color, label: suggestionLabel, isSelected, onSelect }) => (
              <SwatchButton
                key={suggestionLabel}
                color={color}
                label={suggestionLabel}
                isSelected={isSelected}
                onClick={onSelect}
              />
            ),
          )}
        </SwatchRow>
        <SwatchRow label="Custom colors">
          {customColors.map((slotColor, index) => (
            <SwatchSlot
              // Slots are fixed positions, so the index is a stable key.
              key={index}
              value={slotColor}
              label={
                slotColor
                  ? `Custom color ${index + 1}`
                  : `Save the current color as custom color ${index + 1}`
              }
              isSelected={slotColor !== null && value === slotColor}
              onClick={() =>
                slotColor
                  ? onSelectCustom(
                      allowsTransparency
                        ? slotColor
                        : removeTransparency(slotColor),
                    )
                  : setCustomSlot(index, pickerColor)
              }
              onClear={() => setCustomSlot(index, null)}
            />
          ))}
        </SwatchRow>
        <ColorPicker
          label={label}
          color={pickerColor}
          allowsTransparency={allowsTransparency}
          onChange={onPick}
          onChangeEnd={onPickEnd}
        />
      </PopoverPanel>
    </Popover>
  )
}
