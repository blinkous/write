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
  /** Small controls beside the drawer's heading, e.g. undo/redo. */
  headerActions?: ReactNode
  /** Each folds away under its title; all start open. */
  sections: readonly SettingsSection[]
}

/**
 * Settings at the bottom of the sidebar: a ⚙ toggle that slides the drawer up
 * above it. It stays open (across visits too) until toggled closed, sharing
 * the sidebar with the entries; folded sections are remembered too.
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
    <>
      <Drawer
        id={drawerId}
        label="Settings"
        isOpen={isOpen}
        headerActions={headerActions}
      >
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
      <div className={styles.bar}>
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
    </>
  )
}
