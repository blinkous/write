import { Ellipsis } from 'lucide-react'
import type { ReactNode } from 'react'
import { Popover } from './Popover'

type OptionsMenuProps = {
  /** Names the menu, e.g. "Heading 2 options". */
  label: string
  /** Content, or a function receiving `close` and `refocus` (see Popover). */
  children: ReactNode | ((close: () => void, refocus: () => void) => ReactNode)
  placement?: 'below' | 'beside'
  /** Places the ⋯ (e.g. over a tile's corner). */
  className?: string
}

/** The ⋯ menu: more actions for the thing it sits on, the same everywhere. */
export function OptionsMenu({
  label,
  children,
  placement,
  className,
}: OptionsMenuProps) {
  return (
    <Popover
      label={label}
      placement={placement}
      className={className}
      trigger={<Ellipsis aria-hidden="true" />}
    >
      {children}
    </Popover>
  )
}
