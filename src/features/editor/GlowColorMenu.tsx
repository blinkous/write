import { ColorMenu } from '../../design-system'
import {
  resolveTextGlow,
  THEME_TEXT_COLORS,
  type ThemeTextColor,
} from '../../journal-document'
import styles from './GlowColorMenu.module.css'
import type { TextColorMenuProps } from './TextColorMenu'
import { getThemeColorSuggestions } from './themeColorSuggestions'

type GlowColorMenuProps = TextColorMenuProps & {
  /** The chosen glow (theme name or #rrggbb(aa)), or null for no glow. */
  value: string | null
  /** A tile was clicked (closes the menu); null is no glow. */
  onSelect: (glow: string | null) => void
}

/* The page text color's tile becomes "No glow"; it stays a custom color away. */
const [, ...GLOW_THEME_COLORS] = THEME_TEXT_COLORS

/* With no glow, the trigger's letter still glows, softly, so it reads as the glow control. */
const NO_GLOW_TRIGGER_COLOR: ThemeTextColor = 'theme-4'

/**
 * A letter drawn with the current glow, opening the glow menu, the
 * same as the text color menu but with "No glow" (also the reset) first:
 * glow is its own color, drawn behind the letters, so white text with a pink
 * glow reads as neon.
 */
export function GlowColorMenu({
  label,
  value,
  pageTextColor,
  onSelect,
  ...menuProps
}: GlowColorMenuProps) {
  return (
    <ColorMenu
      label={label}
      trigger={
        <span
          aria-hidden="true"
          className={styles.glowLetter}
          style={{
            textShadow:
              resolveTextGlow(value ?? NO_GLOW_TRIGGER_COLOR) ?? undefined,
          }}
        >
          A
        </span>
      }
      suggestionsLabel="Glow colors"
      suggestions={[
        {
          color: null,
          label: 'No glow',
          isSelected: value === null,
          onSelect: () => onSelect(null),
        },
        ...getThemeColorSuggestions(GLOW_THEME_COLORS, value, onSelect),
      ]}
      value={value}
      emptyPickerColor={pageTextColor}
      onSelectCustom={onSelect}
      {...menuProps}
    />
  )
}
