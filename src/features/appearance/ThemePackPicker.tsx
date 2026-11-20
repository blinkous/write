import { Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ConfirmDialog, ScrollRow } from '../../design-system'
import type { CustomThemePack } from './customThemePacks'
import { CustomThemePackTile } from './CustomThemePackTile'
import { THEME_PACKS } from './themePacks'
import { ThemePackTile } from './ThemePackTile'
import type { useCustomThemePacks } from './useCustomThemePacks'
import styles from './ThemePackPicker.module.css'

const ADD_PACK_LABEL = 'Save current look as a theme pack'

type ThemePackPickerProps = {
  /** Looks saved as packs, with their backgrounds, after the curated ones. */
  customPacks: readonly CustomThemePack[]
  packActions: ReturnType<typeof useCustomThemePacks>
}

/**
 * Curated looks as a sideways-scrolling row of little pages, then the ones
 * saved here (with their backgrounds), then a + that saves the current look as another. Choosing one
 * replaces the whole look (one undo step).
 */
export function ThemePackPicker({
  customPacks,
  packActions,
}: ThemePackPickerProps) {
  const [packIdToDelete, setPackIdToDelete] = useState<string | null>(null)
  const addTileRef = useRef<HTMLButtonElement>(null)
  // The deleted pack's ⋯ is gone, so focus lands on the + instead of the page.
  const shouldFocusAddTileRef = useRef(false)

  // After the dialog has closed (its own effect runs first and returns focus to a ⋯ that's gone).
  useEffect(() => {
    if (packIdToDelete !== null || !shouldFocusAddTileRef.current) return
    shouldFocusAddTileRef.current = false
    addTileRef.current?.focus()
  }, [packIdToDelete])

  function confirmDelete() {
    if (packIdToDelete === null) return
    packActions.delete(packIdToDelete)
    shouldFocusAddTileRef.current = true
    setPackIdToDelete(null)
  }

  return (
    <>
      <ScrollRow role="group" aria-label="Theme packs" className={styles.row}>
        {THEME_PACKS.map((pack) => (
          <ThemePackTile
            key={pack.id}
            pack={pack}
            isChosen={packActions.isCuratedChosen(pack)}
            onSelect={() => packActions.chooseCurated(pack)}
          />
        ))}
        {customPacks.map((pack) => (
          <CustomThemePackTile
            key={pack.id}
            pack={pack}
            background={packActions.getTileBackground(pack)}
            isChosen={packActions.isChosen(pack)}
            canUpdate={packActions.canUpdate(pack)}
            onSelect={() => packActions.choose(pack)}
            onUpdate={() => packActions.updateToCurrent(pack.id)}
            onDelete={() => setPackIdToDelete(pack.id)}
          />
        ))}
        {/* Always on: saving a look a pack already has is still saving. */}
        <button
          ref={addTileRef}
          type="button"
          className={`${styles.tile} ${styles.addTile}`}
          aria-label={ADD_PACK_LABEL}
          title={ADD_PACK_LABEL}
          onClick={packActions.saveCurrent}
        >
          <Plus aria-hidden="true" />
        </button>
      </ScrollRow>
      <ConfirmDialog
        isOpen={packIdToDelete !== null}
        title="Delete this theme pack?"
        message="It’s removed from your theme packs. The current look stays as it is."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPackIdToDelete(null)}
      />
    </>
  )
}
