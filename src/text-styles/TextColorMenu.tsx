import { Baseline } from 'lucide-react'
import { Popover, PopoverPanel } from '../design-system'
import { resolveTextColor } from '../journal-document'
import { TextColorSwatches } from './TextColorSwatches'

type TextColorMenuProps = {
  /** Names the menu, e.g. "Text color" or "Title color". */
  label: string
  /** The chosen color (theme name or #rrggbb), or null for the page text color. */
  value: string | null
  pageTextColor: string
  customColors: readonly (string | null)[]
  onCustomColorsChange: (customColors: (string | null)[]) => void
  /** A tile was clicked (closes the menu); null is the page text color. */
  onSelect: (color: string | null) => void
  /** A custom slot is being filled (every step of a drag in the system picker). */
  onPick: (color: string) => void
  onPickEnd?: () => void
  onClose?: () => void
}

/** The color icon, showing the current color, opening the text color swatches. */
export function TextColorMenu({
  label,
  value,
  onSelect,
  onClose,
  ...swatchProps
}: TextColorMenuProps) {
  return (
    <Popover
      label={label}
      trigger={
        <Baseline
          aria-hidden="true"
          style={{ color: resolveTextColor(value) ?? undefined }}
        />
      }
      onClose={onClose}
    >
      {(close) => (
        <PopoverPanel>
          <TextColorSwatches
            value={value}
            onSelect={(color) => {
              onSelect(color)
              close()
            }}
            {...swatchProps}
          />
        </PopoverPanel>
      )}
    </Popover>
  )
}
