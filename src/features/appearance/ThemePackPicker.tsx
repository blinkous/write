import type { CSSProperties } from 'react'
import { ScrollRow } from '../../design-system'
import { getFontOption } from '../../fonts'
import { getTextStyleVariables, TextStylePreview } from '../../text-styles'
import {
  getThemePackColors,
  hasThemeLook,
  THEME_PACKS,
  type ThemeLook,
  type ThemePack,
} from './themePacks'
import styles from './ThemePackPicker.module.css'

/** Inline styles that also set CSS variables. */
type StyleWithVariables = CSSProperties & Record<`--${string}`, string>

/**
 * A tile's own look: the pack's page color, and the same CSS variables the
 * page uses, scoped to the tile so its "Aa" is drawn in the pack's title style.
 */
function getTileStyle({ look }: ThemePack): StyleWithVariables {
  const { backgroundColor, textColor, editorFont, textStyles } = look
  return {
    ...getTextStyleVariables(textStyles),
    '--color-text': textColor,
    '--font-editor': getFontOption(editorFont).family,
    background: backgroundColor,
  }
}

type ThemePackPickerProps = {
  current: ThemeLook
  onSelect: (look: ThemeLook) => void
}

/**
 * Curated looks as a sideways-scrolling row of little pages, named only in
 * their tooltips: each shows its title's look and a few of its colors.
 * Choosing one replaces the whole look (one undo step).
 */
export function ThemePackPicker({ current, onSelect }: ThemePackPickerProps) {
  return (
    <ScrollRow role="group" aria-label="Theme packs" className={styles.row}>
      {THEME_PACKS.map((pack) => (
        <button
          key={pack.id}
          type="button"
          className={styles.tile}
          style={getTileStyle(pack)}
          aria-label={pack.label}
          title={pack.label}
          aria-pressed={hasThemeLook(current, pack)}
          onClick={() => onSelect(pack.look)}
        >
          <span aria-hidden="true" className={styles.sample}>
            <TextStylePreview name="title">Aa</TextStylePreview>
          </span>
          <span aria-hidden="true" className={styles.colors}>
            {getThemePackColors(pack).map((color) => (
              <span
                key={color}
                className={styles.color}
                style={{ background: color }}
              />
            ))}
          </span>
        </button>
      ))}
    </ScrollRow>
  )
}
