import { CaseSensitive } from 'lucide-react'
import { ActionList, MenuItem, Popover } from '../design-system'
import type { TextCase } from '../journal-document'
import { TEXT_CASE_OPTIONS } from './textCaseOptions'

type TextCaseMenuProps = {
  /** Names the menu, e.g. "Text case" or "Title case"; the current case is added to it. */
  label: string
  /** The chosen case, or null for as typed. */
  value: TextCase | null
  /** An option was chosen (the menu closes); null is as typed. */
  onSelect: (textCase: TextCase | null) => void
  onClose?: () => void
}

/**
 * The case icon, opening the case menu: UPPERCASE, lowercase, Title Case,
 * Sentence case, then As typed. Only the display changes; the letters typed
 * are kept. Used for text (toolbar) and text styles (settings).
 */
export function TextCaseMenu({
  label,
  value,
  onSelect,
  onClose,
}: TextCaseMenuProps) {
  const selectedLabel =
    TEXT_CASE_OPTIONS.find((option) => option.value === value)?.label ??
    'as typed'
  return (
    <Popover
      label={`${label}: ${selectedLabel}`}
      trigger={<CaseSensitive aria-hidden="true" />}
      onClose={onClose}
    >
      {(close) => (
        <ActionList>
          {TEXT_CASE_OPTIONS.map((option) => (
            <MenuItem
              key={option.value}
              isSelected={value === option.value}
              onClick={() => {
                onSelect(option.value)
                close()
              }}
            >
              {option.label}
            </MenuItem>
          ))}
          <MenuItem
            isSelected={value === null}
            onClick={() => {
              onSelect(null)
              close()
            }}
          >
            As typed
          </MenuItem>
        </ActionList>
      )}
    </Popover>
  )
}
