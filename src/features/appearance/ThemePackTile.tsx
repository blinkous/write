import type { CSSProperties } from 'react'
import { getFontOption } from '../../fonts'
import { getTextStyleVariables, TextStylePreview } from '../../text-styles'
import { BackgroundMediaPreview } from './BackgroundMediaSettings'
import { getThemePackColors, type NamedThemeLook } from './themePacks'
import type { BackgroundMedia } from './useBackgroundMedia'
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

/** A pack's picture or video behind its tile, at the opacity it has on the page. */
export type TileBackground = { media: BackgroundMedia; opacity: number }

type ThemePackTileProps = {
  pack: NamedThemeLook
  /** A saved pack's background, drawn behind its "Aa" like a tiny page. */
  background?: TileBackground | null
  /** The settings are exactly this pack's look. */
  isChosen: boolean
  onSelect: () => void
}

/**
 * A little page in the pack's look, named only in its tooltip: its title's
 * "Aa" and a few of its colors, over its picture or video (a still) if it has one.
 */
export function ThemePackTile({
  pack,
  background,
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
      {background && (
        <span
          aria-hidden="true"
          className={styles.tileBackground}
          style={{ opacity: `${background.opacity}%` }}
        >
          <BackgroundMediaPreview media={background.media} />
        </span>
      )}
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
