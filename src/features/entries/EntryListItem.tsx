import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Text, TextInput } from '../../design-system'
import { formatEntryDate } from '../../utils/date'
import {
  getEntryTitle,
  MAX_ENTRY_TITLE_LENGTH,
  type JournalEntry,
} from './journalEntry'
import styles from './EntryList.module.css'

type EntryListItemProps = {
  entry: JournalEntry
  isSelected: boolean
  /** Id of the element explaining that the selected entry can be renamed. */
  renameHintId: string
  onSelect: () => void
  onRename: (rawTitle: string) => void
}

/** Clicking an entry opens it; clicking the open entry renames it in place. */
export function EntryListItem({
  entry,
  isSelected,
  renameHintId,
  onSelect,
  onRename,
}: EntryListItemProps) {
  const [isRenaming, setIsRenaming] = useState(false)
  const itemButtonRef = useRef<HTMLButtonElement>(null)
  // Enter/Escape return focus to the entry; clicking elsewhere leaves it there.
  const shouldRestoreFocusRef = useRef(false)
  const title = getEntryTitle(entry)

  useEffect(() => {
    if (isRenaming || !shouldRestoreFocusRef.current) return
    shouldRestoreFocusRef.current = false
    itemButtonRef.current?.focus()
  }, [isRenaming])

  function finishRenaming(rawTitle: string | null, restoreFocus: boolean) {
    // Guards against blur firing again after Enter/Escape already finished.
    if (!isRenaming) return
    if (rawTitle !== null) onRename(rawTitle)
    shouldRestoreFocusRef.current = restoreFocus
    setIsRenaming(false)
  }

  function handleRenameKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      // Otherwise the same keypress "clicks" the entry once focus returns to it,
      // reopening the rename.
      event.preventDefault()
      finishRenaming(event.currentTarget.value, true)
    }
    if (event.key === 'Escape') {
      // Keep Escape from also closing the sidebar.
      event.stopPropagation()
      finishRenaming(null, true)
    }
  }

  const dateCaption = (
    <Text variant="caption">{formatEntryDate(entry.createdAt)}</Text>
  )

  if (isRenaming) {
    return (
      <div className={styles.item} aria-current="page">
        <TextInput
          aria-label="Entry name"
          placeholder="Name this entry"
          defaultValue={title ?? ''}
          maxLength={MAX_ENTRY_TITLE_LENGTH}
          autoFocus
          onFocus={({ currentTarget }) => currentTarget.select()}
          onKeyDown={handleRenameKeyDown}
          onBlur={({ currentTarget }) =>
            finishRenaming(currentTarget.value, false)
          }
        />
        {dateCaption}
      </div>
    )
  }

  return (
    <button
      ref={itemButtonRef}
      type="button"
      className={styles.item}
      aria-current={isSelected ? 'page' : undefined}
      aria-describedby={isSelected ? renameHintId : undefined}
      title={isSelected ? 'Click to rename' : undefined}
      onClick={() => (isSelected ? setIsRenaming(true) : onSelect())}
    >
      <span className={styles.title}>{title ?? 'Untitled'}</span>
      {dateCaption}
    </button>
  )
}
