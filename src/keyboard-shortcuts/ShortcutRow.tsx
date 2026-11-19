import { RotateCcw, X } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'
import { Button, LabeledRow, Text } from '../design-system'
import { formatShortcut } from '../utils/shortcuts'
import {
  getShortcutCommand,
  type ShortcutCommand,
  type ShortcutCommandId,
} from './shortcutCommands'
import { shortcutFromEvent } from './shortcutKeys'
import { checkShortcut } from './shortcutRules'
import {
  assignShortcut,
  isShortcutChanged,
  resetShortcut,
} from './shortcutStore'
import { useShortcuts } from './useShortcuts'
import styles from './ShortcutsDialog.module.css'

type ShortcutRowProps = { command: ShortcutCommand }

function describeShortcut(shortcut: string | null): string {
  return shortcut ? formatShortcut(shortcut) : 'None'
}

/**
 * One action and its shortcut. Pressing the shortcut button listens for the
 * next key combination: Escape cancels, Backspace or Delete leaves it with
 * none, Tab moves on (so the keyboard is never trapped).
 */
export function ShortcutRow({ command }: ShortcutRowProps) {
  const { id, label } = command
  const [isRecording, setIsRecording] = useState(false)
  // Said under the row, where the change was made (e.g. why keys were refused).
  const [message, setMessage] = useState<string | null>(null)
  const getShortcut = useShortcuts()
  const shortcut = getShortcut(id)

  /** Says when another action lost its shortcut to this one. */
  function announceMove(previousOwnerId: ShortcutCommandId | null) {
    if (!previousOwnerId) return
    const previousOwner = getShortcutCommand(previousOwnerId)
    setMessage(
      `${describeShortcut(getShortcut(id))} moved from ${previousOwner.label}, which has none now.`,
    )
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!isRecording) return
    const { key, altKey, ctrlKey, metaKey, shiftKey } = event
    const hasModifier = altKey || ctrlKey || metaKey || shiftKey
    // Tab, Shift+Tab and Option+Tab (Safari's way to reach buttons) always move on: no keyboard trap.
    if (key === 'Tab' && !ctrlKey && !metaKey) {
      setIsRecording(false)
      return
    }
    // Every other key is the recording's, not the page's or the browser's.
    event.preventDefault()
    event.stopPropagation()
    if (key === 'Escape') {
      setIsRecording(false)
      return
    }
    if ((key === 'Backspace' || key === 'Delete') && !hasModifier) {
      assignShortcut(id, null)
      setIsRecording(false)
      return
    }
    const recorded = shortcutFromEvent(event.nativeEvent)
    if (!recorded) return
    const check = checkShortcut(recorded)
    if (!check.isAllowed) {
      setMessage(check.reason)
      return
    }
    setIsRecording(false)
    announceMove(assignShortcut(id, recorded))
  }

  return (
    <>
      <LabeledRow label={label} control="button">
        <span className={styles.controls}>
          <Button
            aria-label={
              isRecording
                ? `${label} shortcut: press keys…`
                : `${label} shortcut: ${describeShortcut(shortcut)}`
            }
            aria-pressed={isRecording}
            className={isRecording ? styles.listening : undefined}
            title={
              isRecording
                ? 'Escape cancels, Backspace removes'
                : 'Change shortcut'
            }
            onClick={({ currentTarget }) => {
              // WebKit doesn't focus a clicked button, so the keys would go elsewhere.
              currentTarget.focus()
              setMessage(null)
              setIsRecording((wasRecording) => !wasRecording)
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => setIsRecording(false)}
          >
            {isRecording ? (
              'Press keys…'
            ) : (
              <kbd className={styles.keys}>{describeShortcut(shortcut)}</kbd>
            )}
          </Button>
          <Button
            iconOnly
            aria-label={`Remove ${label} shortcut`}
            title="Remove shortcut"
            disabled={!shortcut}
            onClick={() => assignShortcut(id, null)}
          >
            <X aria-hidden="true" />
          </Button>
          {/* The reset's place is kept when there's nothing to reset, so every row lines up. */}
          {isShortcutChanged(id) ? (
            <Button
              iconOnly
              aria-label={`Reset ${label} shortcut to ${describeShortcut(command.defaultShortcut)}`}
              title={`Reset to ${describeShortcut(command.defaultShortcut)}`}
              onClick={() => announceMove(resetShortcut(id))}
            >
              <RotateCcw aria-hidden="true" />
            </Button>
          ) : (
            <span className={styles.emptySlot} />
          )}
        </span>
      </LabeledRow>
      {/* Always rendered, so screen readers hear a message as it appears. */}
      <Text variant="caption" role="status">
        {message}
      </Text>
    </>
  )
}
