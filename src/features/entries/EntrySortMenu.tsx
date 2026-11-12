import { ArrowDownUp } from 'lucide-react'
import { ChoiceGroup, Popover } from '../../design-system'
import { ENTRY_SORT_OPTIONS, type EntrySort } from './entrySort'

type EntrySortMenuProps = {
  sort: EntrySort
  onSortChange: (sort: EntrySort) => void
}

/** How the entries list is ordered. */
export function EntrySortMenu({ sort, onSortChange }: EntrySortMenuProps) {
  const sortLabel =
    ENTRY_SORT_OPTIONS.find(({ value }) => value === sort)?.label ?? ''
  return (
    <Popover
      label={`Sort entries: ${sortLabel}`}
      align="start"
      trigger={<ArrowDownUp aria-hidden="true" />}
    >
      {(close) => (
        <ChoiceGroup
          label="Sort entries"
          choices={ENTRY_SORT_OPTIONS}
          selectedValue={sort}
          onSelect={onSortChange}
          onChoose={close}
        />
      )}
    </Popover>
  )
}
