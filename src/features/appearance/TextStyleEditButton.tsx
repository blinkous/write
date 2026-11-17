import { SlidersHorizontal } from 'lucide-react'
import { Popover } from '../../design-system'
import { TEXT_STYLE_LABELS } from '../../text-styles'
import {
  TextStyleControls,
  type TextStyleControlsProps,
} from './TextStyleControls'

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
