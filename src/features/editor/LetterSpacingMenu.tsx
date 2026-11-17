import { LetterSpacing } from 'lucide-react'
import { StepperMenu } from '../../design-system'
import { TEXT_STYLE_LETTER_SPACING_RANGE } from '../../text-styles'

type LetterSpacingMenuProps = {
  /** Names the value, e.g. "Letter spacing" or "Title letter spacing". */
  label: string
  /** % of the text's size. */
  value: number
  onChange: (letterSpacing: number) => void
  onReset: () => void
  canReset: boolean
  onClose?: () => void
}

/** Letter spacing (% of the size) behind its icon: the toolbar's, and each text style's. */
export function LetterSpacingMenu(props: LetterSpacingMenuProps) {
  return (
    <StepperMenu
      {...props}
      icon={<LetterSpacing aria-hidden="true" />}
      min={TEXT_STYLE_LETTER_SPACING_RANGE.min}
      max={TEXT_STYLE_LETTER_SPACING_RANGE.max}
      unit="%"
    />
  )
}
