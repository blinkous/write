import type { CSSProperties } from 'react'
import { getFontOption } from '../../fonts'
import { getTextStyleVariables, TextStylePreview } from '../../text-styles'
import { getThemePackColors, type NamedThemeLook } from './themePacks'
import styles from './ThemePackPicker.module.css'

/** Inline styles that also set CSS variables. */
export type StyleWithVariables = CSSProperties & Record<`--${string}`, string>

/**
 * A tile's own look: the pack's page color, and the same CSS variables the
 * page uses, scoped to the tile so its "Aa" is drawn in the pack's title style.
 */
function getTileStyle({ look }: NamedThemeLook): StyleWithVariables {
  const { backgroundColor, textColor, editorFont, textStyles } = look
  return {
    ...getTextStyleVariables(textStyles),
    '--color-text': textColor,
    '--font-editor': getFontOption(editorFont).family,
    background: backgroundColor,
  }
}

type ThemePackTileProps = {
  pack: NamedThemeLook
  /** The settings are exactly this pack's look. */
  isChosen: boolean
  onSelect: () => void
}

/** A little page in the pack's look, named only in its tooltip: its title's "Aa" and a few of its colors. */
export function ThemePackTile({
  pack,
  isChosen,
  onSelect,
}: ThemePackTileProps) {
  const { label } = pack
  return (
    <button
      type="button"
      className={styles.tile}
      style={getTileStyle(pack)}
      aria-label={label}
      title={label}
      aria-pressed={isChosen}
      onClick={onSelect}
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
  )
}
