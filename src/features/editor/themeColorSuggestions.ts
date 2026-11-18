import type { ColorSuggestion } from '../../design-system'
import {
  getThemeColorToken,
  THEME_TEXT_COLORS,
  type ThemeTextColor,
} from '../../journal-document'

/**
 * Theme colors (live shades of the page background) as color menu tiles,
 * named by their place in the theme ("Theme color 3"). Shared by the text
 * color and glow menus, so a theme color looks and reads the same in both.
 */
export function getThemeColorSuggestions(
  themeColors: readonly ThemeTextColor[],
  value: string | null,
  onSelect: (themeColor: ThemeTextColor) => void,
): ColorSuggestion[] {
  return themeColors.map((themeColor) => ({
    color: getThemeColorToken(themeColor),
    label: `Theme color ${THEME_TEXT_COLORS.indexOf(themeColor) + 1}`,
    isSelected: value === themeColor,
    onSelect: () => onSelect(themeColor),
  }))
}

/**
 * A stored text color or glow as #rrggbb(aa), for the color picker to start
 * from: a theme name as its current shade, and none (null) as the page text
 * color. `themeColors` are the theme's shades, in order.
 */
export function getPickerColor(
  value: string | null,
  themeColors: readonly string[],
): string {
  const [pageTextColor] = themeColors
  if (value === null) return pageTextColor
  const themeIndex = THEME_TEXT_COLORS.findIndex(
    (themeColor) => themeColor === value,
  )
  return themeIndex === -1 ? value : (themeColors[themeIndex] ?? pageTextColor)
}
