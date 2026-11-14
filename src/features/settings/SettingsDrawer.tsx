import { Settings } from 'lucide-react'
import { useEffect, useId, useState, type ReactNode } from 'react'
import { Button, Drawer, DrawerSection } from '../../design-system'
import {
  loadClosedSectionIds,
  loadIsSettingsOpen,
  saveClosedSectionIds,
  saveIsSettingsOpen,
} from './settingsStorage'
import styles from './SettingsDrawer.module.css'

export type SettingsSection = {
  /** Stable name, used to remember whether the section is folded. */
  id: string
  title: string
  content: ReactNode
}

type SettingsDrawerProps = {
  /** Small controls shown in the bottom bar while open, e.g. undo/redo. */
  headerActions?: ReactNode
  /** Each folds away under its title; all start open. */
  sections: readonly SettingsSection[]
}

/**
 * Settings at the bottom of the sidebar: a ⚙ toggle that slides the drawer up
 * above it. It stays open (across visits too) until toggled closed, sharing
 * the sidebar with the entries; folded sections are remembered too. The bar
 * holds the drawer's controls: while open, undo/redo sit by the highlighted toggle.
 */
export function SettingsDrawer({
  headerActions,
  sections,
}: SettingsDrawerProps) {
  const drawerId = useId()
  const [isOpen, setIsOpen] = useState(loadIsSettingsOpen)
  const [closedSectionIds, setClosedSectionIds] = useState(loadClosedSectionIds)
  useEffect(() => saveIsSettingsOpen(isOpen), [isOpen])
  useEffect(() => saveClosedSectionIds(closedSectionIds), [closedSectionIds])

  function toggleSection(sectionId: string, isSectionOpen: boolean) {
    setClosedSectionIds((closedIds) =>
      isSectionOpen
        ? closedIds.filter((closedId) => closedId !== sectionId)
        : [...new Set([...closedIds, sectionId])],
    )
  }

  return (
    <div className={styles.settings} data-open={isOpen}>
      <Drawer id={drawerId} label="Settings" isOpen={isOpen}>
        {sections.map(({ id, title, content }) => (
          <DrawerSection
            key={id}
            title={title}
            isOpen={!closedSectionIds.includes(id)}
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
