import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Button } from './Button'
import { TextInput } from './TextInput'
import styles from './EditableText.module.css'

type EditableTextProps = {
  /** Names the value, e.g. "Tab title". */
  label: string
  value: string
  /** Shown while the value is empty, e.g. the default it falls back to. */
  placeholder: string
  maxLength?: number
  /** Each keystroke, so the change shows live (e.g. in the tab). */
  onChange: (value: string) => void
  /** Editing ended with this value: as typed on Enter or leaving the field, as it was on Escape. */
  onEditEnd: (value: string) => void
}

/**
 * A value shown as quiet text (its placeholder while empty) that becomes a
 * field in place when clicked, in the same box so nothing shifts.
 */
export function EditableText({
  label,
  value,
  placeholder,
  maxLength,
  onChange,
  onEditEnd,
}: EditableTextProps) {
  // The value before editing, to put back on Escape; null while not editing.
  const [valueBeforeEdit, setValueBeforeEdit] = useState<string | null>(null)
  const isEditing = valueBeforeEdit !== null
  const displayRef = useRef<HTMLButtonElement>(null)
  // Enter/Escape return focus to the text; clicking elsewhere leaves it there.
  const shouldRestoreFocusRef = useRef(false)

  useEffect(() => {
    if (isEditing || !shouldRestoreFocusRef.current) return
    shouldRestoreFocusRef.current = false
    displayRef.current?.focus()
  }, [isEditing])

  function finishEditing(finalValue: string, restoreFocus: boolean) {
    // Guards against blur firing again after Enter/Escape already finished.
    if (!isEditing) return
    shouldRestoreFocusRef.current = restoreFocus
    setValueBeforeEdit(null)
    onEditEnd(finalValue)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      // Otherwise the same keypress "clicks" the text once focus returns to it.
      event.preventDefault()
      finishEditing(event.currentTarget.value, true)
    }
    if (event.key === 'Escape' && valueBeforeEdit !== null) {
      // Keep Escape from also closing what the text is in.
      event.stopPropagation()
      finishEditing(valueBeforeEdit, true)
    }
  }

  return (
    <div className={styles.editableText}>
      {isEditing ? (
        <span className={styles.box}>
          <TextInput
            variant="inline"
            className={styles.input}
            aria-label={label}
            value={value}
            placeholder={placeholder}
            maxLength={maxLength}
            spellCheck={false}
            autoComplete="off"
            autoFocus
            onFocus={({ currentTarget }) => currentTarget.select()}
            onChange={({ target }) => onChange(target.value)}
            onKeyDown={handleKeyDown}
            onBlur={({ currentTarget }) =>
              finishEditing(currentTarget.value, false)
            }
          />
        </span>
      ) : (
        <Button
          ref={displayRef}
          variant="ghost"
          className={`${styles.box} ${styles.display}`}
          aria-label={`${label}: ${value || placeholder}`}
          title="Click to edit"
          onClick={() => setValueBeforeEdit(value)}
        >
          {value || placeholder}
        </Button>
      )}
    </div>
  )
}
