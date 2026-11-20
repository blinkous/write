import { RefreshCw, Trash2 } from 'lucide-react'
import { ActionList, MenuItem, OptionsMenu } from '../../design-system'
import type { CustomThemePack } from './customThemePacks'
import { ThemePackTile, type StyleWithVariables } from './ThemePackTile'
import styles from './ThemePackPicker.module.css'

type CustomThemePackTileProps = {
  pack: CustomThemePack
  isChosen: boolean
  /** Off while the pack already is what's showing. */
  canUpdate: boolean
  onSelect: () => void
  /** Saves the current look into this pack. */
  onUpdate: () => void
  /** Asks first (see ThemePackPicker). */
  onDelete: () => void
}

/**
 * A saved pack's tile, with its ⋯ always showing in the corner: it marks the
 * packs someone added, and works the same with or without hover.
 */
export function CustomThemePackTile({
  pack,
  isChosen,
  canUpdate,
  onSelect,
  onUpdate,
  onDelete,
}: CustomThemePackTileProps) {
  const { label, look } = pack
  // The ⋯ is drawn in the pack's text color, so it shows on the pack's page color.
  const optionsColor: StyleWithVariables = {
    '--theme-tile-text': look.textColor,
  }
  return (
    <div className={styles.customTile} style={optionsColor}>
      <ThemePackTile pack={pack} isChosen={isChosen} onSelect={onSelect} />
      <OptionsMenu label={`${label} options`} className={styles.packOptions}>
        {(close) => (
          <ActionList>
            <MenuItem
              icon={RefreshCw}
              disabled={!canUpdate}
              onClick={() => {
                onUpdate()
                close()
              }}
            >
              Update pack to match
            </MenuItem>
            <MenuItem
              icon={Trash2}
              onClick={() => {
                close()
                onDelete()
              }}
            >
              Delete
            </MenuItem>
          </ActionList>
        )}
      </OptionsMenu>
    </div>
  )
}
