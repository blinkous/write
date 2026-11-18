import { Baseline } from 'lucide-react'
import { ColorMenu } from '../../design-system'
import {
  getThemeColorToken,
  resolveTextColor,
  THEME_TEXT_COLORS,
} from '../../journal-document'
import {
  getPickerColor,
  getThemeColorSuggestions,
} from './themeColorSuggestions'

export type TextColorMenuProps = {
  /** Names the menu, e.g. "Text color" or "Title color". */
  label: string
  /** The chosen color (theme name or #rrggbb(aa)), or null for the page text color. */
  value: string | null
  /** The theme's shades as #rrggbb(aa), the page text color first, for the picker. */
  themeColors: readonly string[]
  customColors: readonly (string | null)[]
  onCustomColorsChange: (customColors: (string | null)[]) => void
  /** A tile was clicked; null is the page text color. */
  onSelect: (color: string | null) => void
  /** The picker changed the color (every step of a drag). */
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
  themeColors,
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
      pickerColor={getPickerColor(value, themeColors)}
      allowsTransparency
      onSelectCustom={onSelect}
      {...menuProps}
    />
  )
}
