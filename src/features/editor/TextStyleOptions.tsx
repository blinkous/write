import { Ellipsis } from 'lucide-react'
import {
  ActionList,
  LabeledRow,
  MenuItem,
  NumberStepper,
  Popover,
  PopoverPanel,
  ResetMenuItem,
} from '../../design-system'
import { TEXT_STYLE_SIZE_RANGE } from '../../text-styles'

type TextStyleOptionsProps = {
  /** The style's name, e.g. "Heading 2". */
  label: string
  /** Makes the style look like the selected text (see matchTextStyle). */
  onMatch: () => void
  /** Makes the selected text look like the style (see matchTextToStyle). */
  onMatchText: () => void
  /** px; only a style has a size (see the root SPEC). */
  size: number
  onSizeChange: (size: number) => void
  /** Whether the style differs from its defaults, so there's something to reset. */
  canReset: boolean
  onReset: () => void
}

/**
 * A text style's ⋯ at the end of its row in the style menu: update it to match
 * the selected text (the toolbar is the one place formatting is set), or the
 * reverse, update the selected text to match it; its size; and a reset of the style
 * as the last row.
 */
export function TextStyleOptions({
  label,
  onMatch,
  onMatchText,
  size,
  onSizeChange,
  canReset,
  onReset,
}: TextStyleOptionsProps) {
  return (
    <Popover
      label={`${label} options`}
      placement="beside"
      trigger={<Ellipsis aria-hidden="true" />}
    >
      {(_close, refocus) => (
        <>
          <ActionList>
            <MenuItem onClick={onMatch}>Update to match selection</MenuItem>
            <MenuItem onClick={onMatchText}>
              Update text to match style
            </MenuItem>
          </ActionList>
          <PopoverPanel width="regular">
            <LabeledRow label="Size" control="icon">
              <NumberStepper
                label={`${label} size`}
                value={size}
                min={TEXT_STYLE_SIZE_RANGE.min}
                max={TEXT_STYLE_SIZE_RANGE.max}
                unit="px"
                onChange={onSizeChange}
              />
            </LabeledRow>
          </PopoverPanel>
          <ResetMenuItem
            label="Reset style"
            canReset={canReset}
            onReset={onReset}
            refocus={refocus}
          />
        </>
      )}
    </Popover>
  )
}
