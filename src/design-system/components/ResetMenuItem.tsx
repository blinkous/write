import { RotateCcw } from 'lucide-react'
import { ActionList } from './ActionList'
import { MenuItem } from './MenuItem'

type ResetMenuItemProps = {
  /** What it resets, e.g. "Reset style". */
  label: string
  /** Off while there's nothing to reset. */
  canReset: boolean
  onReset: () => void
  /** The popover's `refocus`: the row turns off once used, so focus moves on rather than being lost. */
  refocus: () => void
}

/** A menu's reset, as its last row: ↺ and what it resets. */
export function ResetMenuItem({
  label,
  canReset,
  onReset,
  refocus,
}: ResetMenuItemProps) {
  return (
    <ActionList>
      <MenuItem
        disabled={!canReset}
        onClick={() => {
          refocus()
          onReset()
        }}
      >
        <RotateCcw aria-hidden="true" />
        {label}
      </MenuItem>
    </ActionList>
  )
}
