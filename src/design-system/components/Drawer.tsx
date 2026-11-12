import type { ReactNode } from 'react'
import { Chevron } from './Chevron'
import styles from './Drawer.module.css'

type DrawerProps = {
  id: string
  /** Names the drawer for screen readers and as its visible heading. */
  label: string
  isOpen: boolean
  /** Small controls beside the heading, e.g. undo/redo. */
  headerActions?: ReactNode
  children: ReactNode
}

/**
 * A panel that slides up from the bottom of its container and stays open
 * until its toggle closes it; the content above shrinks to make room, so both
 * stay usable. Opened by a separate toggle with `aria-controls={id}`.
 */
export function Drawer({
  id,
  label,
  isOpen,
  headerActions,
  children,
}: DrawerProps) {
  return (
    <section
      id={id}
      aria-label={label}
      className={styles.drawer}
      data-open={isOpen}
      inert={!isOpen}
    >
      <div className={styles.clip}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h2 className={styles.title}>{label}</h2>
            {headerActions && (
              <div className={styles.headerActions}>{headerActions}</div>
            )}
          </div>
          {children}
        </div>
      </div>
    </section>
  )
}

type DrawerSectionProps = {
  title: string
  isOpen: boolean
  onToggle: (isOpen: boolean) => void
  children: ReactNode
}

/**
 * A titled group of settings in a drawer that folds away under its title
 * (native details/summary, so it's keyboard and screen reader friendly).
 */
export function DrawerSection({
  title,
  isOpen,
  onToggle,
  children,
}: DrawerSectionProps) {
  return (
    <details
      className={styles.section}
      open={isOpen}
      onToggle={({ currentTarget }) => onToggle(currentTarget.open)}
    >
      <summary className={styles.sectionTitle}>
        {title}
        <Chevron className={styles.chevron} />
      </summary>
      <div className={styles.sectionContent}>{children}</div>
    </details>
  )
}
