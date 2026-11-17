import type { ColorSuggestion } from '../design-system'
import {
  getThemeColorToken,
  THEME_TEXT_COLORS,
  type ThemeTextColor,
} from '../journal-document'

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
