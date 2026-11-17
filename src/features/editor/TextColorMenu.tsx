import { Baseline } from 'lucide-react'
import { ColorMenu } from '../../design-system'
import {
  getThemeColorToken,
  resolveTextColor,
  THEME_TEXT_COLORS,
} from '../../journal-document'
import { getThemeColorSuggestions } from './themeColorSuggestions'

export type TextColorMenuProps = {
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

const [PAGE_TEXT_THEME_COLOR, ...OTHER_THEME_COLORS] = THEME_TEXT_COLORS

/**
 * The color icon, showing the current color, opening the text color menu:
 * theme colors (live shades of the page background; the first is the page
 * text color itself, so it also serves as reset), then the custom colors.
 * The toolbar's text color menu (TextColorPicker); GlowColorMenu builds on it.
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
      suggestions={[
        {
          color: getThemeColorToken(PAGE_TEXT_THEME_COLOR),
          label: 'Page text color',
          isSelected: value === null || value === PAGE_TEXT_THEME_COLOR,
          onSelect: () => onSelect(null),
        },
        ...getThemeColorSuggestions(OTHER_THEME_COLORS, value, onSelect),
      ]}
      value={value}
      emptyPickerColor={pageTextColor}
      onSelectCustom={onSelect}
      {...menuProps}
    />
  )
}
