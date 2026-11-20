import { Settings } from 'lucide-react'
import {
  useEffect,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { Button, Drawer, DrawerSection } from '../../design-system'
import { isTextEntry } from '../../utils/textEntry'
import { getUndoKey } from '../../utils/undoKeys'
import {
  loadIsSettingsOpen,
  loadOpenSectionIds,
  saveIsSettingsOpen,
  saveOpenSectionIds,
} from './settingsStorage'
import styles from './SettingsDrawer.module.css'

export type SettingsSection = {
  /** Stable name, used to remember whether the section is folded. */
  id: string
  title: string
  content: ReactNode
  /** Open until folded for the first time; otherwise starts folded. */
  isOpenByDefault?: boolean
}

type SettingsDrawerProps = {
  /** Small controls shown in the bottom bar while open, e.g. undo/redo. */
  headerActions?: ReactNode
  /** The platform's undo key (⌘Z) while focus is in the settings, outside a text field. */
  onUndo: () => void
  /** The platform's redo key (⇧⌘Z) while focus is in the settings, outside a text field. */
  onRedo: () => void
  /** Each folds away under its title. */
  sections: readonly SettingsSection[]
}

/**
 * Settings at the bottom of the sidebar: a ⚙ toggle that slides the drawer up
 * above it. It starts open and stays open (across visits too) until toggled closed, sharing
 * the sidebar with the entries; folded sections are remembered too. The bar
 * holds the drawer's controls: while open, undo/redo sit by the highlighted toggle.
 * While focus is in it, the undo and redo keys undo settings; text fields keep
 * their own.
 */
export function SettingsDrawer({
  headerActions,
  onUndo,
  onRedo,
  sections,
}: SettingsDrawerProps) {
  const drawerId = useId()
  const [isOpen, setIsOpen] = useState(loadIsSettingsOpen)
  const [openSectionIds, setOpenSectionIds] = useState(() =>
    loadOpenSectionIds(
      sections.map(({ id }) => id),
      sections
        .filter(({ isOpenByDefault }) => isOpenByDefault)
        .map(({ id }) => id),
    ),
  )
  useEffect(() => saveIsSettingsOpen(isOpen), [isOpen])
  useEffect(() => saveOpenSectionIds(openSectionIds), [openSectionIds])

  function toggleSection(sectionId: string, isSectionOpen: boolean) {
    setOpenSectionIds((openIds) =>
      isSectionOpen
        ? [...new Set([...openIds, sectionId])]
        : openIds.filter((openId) => openId !== sectionId),
    )
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.defaultPrevented || isTextEntry(event.target)) return
    const undoKey = getUndoKey(event.nativeEvent)
    if (!undoKey) return
    event.preventDefault()
    if (undoKey === 'undo') onUndo()
    else onRedo()
  }

  return (
    <div
      className={styles.settings}
      data-open={isOpen}
      /*
       * Focusable from a click, never a Tab stop: WebKit doesn't focus a
       * clicked button, so a click anywhere in the settings still puts focus
       * here, where the undo keys apply.
       */
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <Drawer id={drawerId} label="Settings" isOpen={isOpen}>
        {sections.map(({ id, title, content }) => (
          <DrawerSection
            key={id}
            title={title}
            isOpen={openSectionIds.includes(id)}
            onToggle={(isSectionOpen) => toggleSection(id, isSectionOpen)}
          >
            {content}
          </DrawerSection>
        ))}
      </Drawer>
      {/* The drawer's controls, down by its toggle; the shaded ⚙ shows it's open. */}
      <div className={styles.bar}>
        {/* Slide in beside the toggle while open; out of reach while closed. */}
        <div className={styles.actions} data-open={isOpen} inert={!isOpen}>
          {headerActions}
        </div>
        <Button
          iconOnly
          aria-label="Settings"
          title="Settings"
          aria-expanded={isOpen}
          aria-controls={drawerId}
          onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        >
          <Settings aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
