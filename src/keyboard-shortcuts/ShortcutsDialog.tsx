import { useId, useRef, useState } from 'react'
import {
  Button,
  Checkbox,
  ConfirmDialog,
  Dialog,
  ResetMenuItem,
  Text,
} from '../design-system'
import { SHORTCUT_COMMANDS, type ShortcutCommand } from './shortcutCommands'
import { resetAllShortcuts } from './shortcutStore'
import { ShortcutRow } from './ShortcutRow'
import { setShortcutsShown, useAreShortcutsShown } from './shortcutVisibility'
import { useShortcutOverrides } from './useShortcuts'
import styles from './ShortcutsDialog.module.css'

type ShortcutsDialogProps = {
  isOpen: boolean
  onClose: () => void
}

/** The actions in their groups, in list order. */
const COMMAND_GROUPS = [
  ...new Set(SHORTCUT_COMMANDS.map(({ group }) => group)),
].map((group) => ({
  group,
  commands: SHORTCUT_COMMANDS.filter((command) => command.group === group),
}))

function ShortcutGroup({
  group,
  commands,
}: {
  group: string
  commands: readonly ShortcutCommand[]
}) {
  const headingId = useId()
  return (
    <div role="group" aria-labelledby={headingId} className={styles.group}>
      <Text variant="caption" id={headingId}>
        {group}
      </Text>
      {commands.map((command) => (
        <ShortcutRow key={command.id} command={command} />
      ))}
    </div>
  )
}

/**
 * Every action's shortcut, each changeable, then a reset for all of them. A
 * dialog, since the list is long and needs room. Escape while recording
 * cancels the recording, not the dialog (see ShortcutRow).
 */
export function ShortcutsDialog({ isOpen, onClose }: ShortcutsDialogProps) {
  const groupsRef = useRef<HTMLDivElement>(null)
  const hasChanges = Object.keys(useShortcutOverrides()).length > 0
  const areShortcutsShown = useAreShortcutsShown()
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)
  const isResetConfirmedRef = useRef(false)

  /*
   * Runs once the confirmation has closed and handed focus back to the reset
   * row: only then reset (which turns the row off) and move focus to the
   * first shortcut, so focus is never left on a disabled button.
   */
  function handleResetConfirmClosed() {
    setIsResetConfirmOpen(false)
    if (!isResetConfirmedRef.current) return
    isResetConfirmedRef.current = false
    resetAllShortcuts()
    groupsRef.current?.querySelector('button')?.focus()
  }

  return (
    <>
      <Dialog
        isOpen={isOpen}
        title="Keyboard shortcuts"
        onClose={onClose}
        actions={
          <Button variant="subtle" onClick={onClose}>
            Done
          </Button>
        }
      >
        {/* Off by default without a mouse or trackpad (e.g. phones), where shortcuts only take room. */}
        <Checkbox
          label="Show shortcuts in menus and tooltips"
          checked={areShortcutsShown}
          onChange={({ target }) => setShortcutsShown(target.checked)}
        />
        <div ref={groupsRef} className={styles.groups}>
          {COMMAND_GROUPS.map(({ group, commands }) => (
            <ShortcutGroup key={group} group={group} commands={commands} />
          ))}
        </div>
        <ResetMenuItem
          label="Reset shortcuts"
          canReset={hasChanges}
          onReset={() => setIsResetConfirmOpen(true)}
          // Focus stays on the row while it asks; see handleResetConfirmClosed.
          refocus={() => {}}
        />
      </Dialog>
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset all shortcuts?"
        message="Every shortcut goes back to its default, and the ones you changed are lost."
        confirmLabel="Reset shortcuts"
        onConfirm={() => {
          isResetConfirmedRef.current = true
          setIsResetConfirmOpen(false)
        }}
        onCancel={handleResetConfirmClosed}
      />
    </>
  )
}
