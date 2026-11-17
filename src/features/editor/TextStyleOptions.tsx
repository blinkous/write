import { Ellipsis, RotateCcw } from 'lucide-react'
import {
  ActionList,
  Button,
  Divider,
  LabeledRow,
  MenuFooter,
  MenuItem,
  NumberStepper,
  Popover,
  PopoverPanel,
} from '../../design-system'
import { TEXT_STYLE_SIZE_RANGE } from '../../text-styles'

type TextStyleOptionsProps = {
  /** The style's name, e.g. "Heading 2". */
  label: string
  /** Makes the style look like the selected text (see matchTextStyle). */
  onMatch: () => void
  /** px; only a style has a size (see the root SPEC). */
  size: number
  onSizeChange: (size: number) => void
  /** Whether the style differs from its defaults, so there's something to reset. */
  canReset: boolean
  onReset: () => void
}

/**
 * A text style's ⋯ at the end of its row in the style menu: update it to match
 * the selected text (the toolbar is the one place formatting is set), its
 * size, and a reset at the bottom right.
 */
export function TextStyleOptions({
  label,
  onMatch,
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
          </ActionList>
          <Divider orientation="horizontal" />
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
          <MenuFooter>
            <Button
              iconOnly
              aria-label={`Reset ${label.toLowerCase()} style`}
              title={`Reset ${label.toLowerCase()} style`}
              disabled={!canReset}
              onClick={() => {
                // It turns off once reset, so focus moves on rather than being lost.
                refocus()
                onReset()
              }}
            >
              <RotateCcw aria-hidden="true" />
            </Button>
          </MenuFooter>
        </>
      )}
    </Popover>
  )
}
