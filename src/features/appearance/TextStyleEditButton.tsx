import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { Button, MenuFooter, Popover } from '../../design-system'
import { DEFAULT_TEXT_STYLES, TEXT_STYLE_LABELS } from '../../text-styles'
import {
  TextStyleControls,
  type TextStyleControlsProps,
} from './TextStyleControls'
import { ThemeHistoryButtons } from './ThemeSettings'
import type { usePageTheme } from './usePageTheme'

/** Opens a text style's controls beside it, e.g. at the end of its row in the style menu. */
export function TextStyleEditButton(props: TextStyleControlsProps) {
  const { name } = props
  const label = `Edit ${TEXT_STYLE_LABELS[name].toLowerCase()} style`
  return (
    <Popover
      label={label}
      placement="beside"
      trigger={<SlidersHorizontal aria-hidden="true" />}
    >
      {(_close, refocus) => <TextStyleControls {...props} refocus={refocus} />}
    </Popover>
  )
}

/** Undo/redo (the settings' one history) and a reset for every text style, for the foot of the style menu. */
export function TextStylesFooter({
  pageTheme,
}: {
  pageTheme: ReturnType<typeof usePageTheme>
}) {
  const { textStyles, resetTextStyles } = pageTheme
  const isAllDefault =
    JSON.stringify(textStyles) === JSON.stringify(DEFAULT_TEXT_STYLES)
  return (
    <MenuFooter>
      <ThemeHistoryButtons pageTheme={pageTheme} />
      <Button
        iconOnly
        aria-label="Reset all styles"
        title="Reset all styles"
        disabled={isAllDefault}
        onClick={resetTextStyles}
      >
        <RotateCcw aria-hidden="true" />
      </Button>
    </MenuFooter>
  )
}
