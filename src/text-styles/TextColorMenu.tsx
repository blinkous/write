import { Baseline } from 'lucide-react'
import { ColorMenu } from '../design-system'
import {
  getThemeColorToken,
  resolveTextColor,
  THEME_TEXT_COLORS,
} from '../journal-document'

type TextColorMenuProps = {
  /** Names the menu, e.g. "Text color" or "Title color". */
  label: string
  /** The chosen color (theme name or #rrggbb), or null for the page text color. */
  value: string | null
  /** Shown as the starting color when filling an empty custom slot. */
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

/**
 * The color icon, showing the current color, opening the text color menu:
 * theme colors (live shades of the page background; the first is the page
 * text color itself, so it also serves as reset), then the custom colors.
 * Used for text (toolbar) and text styles (settings).
 */
export function TextColorMenu({
  label,
  value,
  pageTextColor,
  onSelect,
  ...menuProps
}: TextColorMenuProps) {
  return (
    <ColorMenu
      label={label}
      trigger={
        <Baseline
          aria-hidden="true"
          style={{ color: resolveTextColor(value) ?? undefined }}
        />
      }
      suggestionsLabel="Theme colors"
      suggestions={THEME_TEXT_COLORS.map((themeColor, index) => {
        const isPageTextColor = index === 0
        return {
          color: getThemeColorToken(themeColor),
          label: isPageTextColor
            ? 'Page text color'
            : `Theme color ${index + 1}`,
          isSelected: isPageTextColor
            ? value === null || value === themeColor
            : value === themeColor,
          onSelect: () => onSelect(isPageTextColor ? null : themeColor),
        }
      })}
      value={value}
      emptyPickerColor={pageTextColor}
      onSelectCustom={onSelect}
      {...menuProps}
    />
  )
}
