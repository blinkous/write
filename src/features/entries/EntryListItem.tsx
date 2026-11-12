import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { HighlightedText, Text, TextInput } from '../../design-system'
import { formatEntryDate } from '../../utils/date'
import { getEntryTitle, MAX_ENTRY_TITLE_LENGTH } from './journalEntry'
import type { EntryMatch } from './entrySearch'
import styles from './EntryList.module.css'

type EntryListItemProps = {
  /** The entry, with search highlights (none when not searching). */
  match: EntryMatch
  isSelected: boolean
  /** Id of the element explaining that the selected entry can be renamed. */
  renameHintId: string
  onSelect: () => void
  onRename: (rawTitle: string) => void
  /** Show when it was last edited instead of when it was made (e.g. when sorted that way). */
  showsEditedDate?: boolean
}

function placeCaretAtEnd(input: HTMLInputElement) {
  const { length } = input.value
  input.setSelectionRange(length, length)
}

/** Clicking an entry opens it; clicking the open entry renames it in place. */
export function EntryListItem({
  match,
  isSelected,
  renameHintId,
  onSelect,
  onRename,
  showsEditedDate = false,
}: EntryListItemProps) {
  const { entry, title: highlightedTitle, snippet } = match
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
    <Text variant="caption">
      {showsEditedDate
        ? `Edited ${formatEntryDate(entry.updatedAt)}`
        : formatEntryDate(entry.createdAt)}
    </Text>
  )

  if (isRenaming) {
    return (
      <div className={styles.item} aria-current="page">
        {/* Same wrapper as the title it replaces, so font and position match exactly. */}
        <span className={styles.title}>
          <TextInput
            variant="inline"
            aria-label="Entry name"
            placeholder="Name this entry"
            defaultValue={title ?? ''}
            maxLength={MAX_ENTRY_TITLE_LENGTH}
            autoFocus
            onFocus={({ currentTarget }) => placeCaretAtEnd(currentTarget)}
            onKeyDown={handleRenameKeyDown}
            onBlur={({ currentTarget }) =>
              finishRenaming(currentTarget.value, false)
            }
          />
        </span>
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
      <span className={styles.title}>
        <HighlightedText
          text={highlightedTitle.text}
          ranges={highlightedTitle.ranges}
        />
      </span>
      {snippet ? (
        <span className={styles.snippet}>
          <HighlightedText text={snippet.text} ranges={snippet.ranges} />
        </span>
      ) : (
        dateCaption
      )}
    </button>
  )
}
