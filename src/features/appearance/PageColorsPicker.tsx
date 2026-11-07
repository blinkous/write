import { Palette } from 'lucide-react'
import { ColorInput, Field, Popover } from '../../design-system'
import type { Appearance } from './appearanceOptions'
import styles from './AppearanceControls.module.css'

type PageColorsPickerProps = {
  backgroundColor: string
  textColor: string
  onChange: (changes: Partial<Appearance>) => void
}

/**
 * Page-wide background and default text color. Text without its own color
 * (set from the editor toolbar) follows the page text color, as does the UI.
 */
export function PageColorsPicker({
  backgroundColor,
  textColor,
  onChange,
}: PageColorsPickerProps) {
  return (
    <Popover
      label="Page colors"
      align="start"
      trigger={<Palette aria-hidden="true" />}
    >
      <div className={styles.colorRow}>
        <Field label="Background">
          <ColorInput
            value={backgroundColor}
            onChange={({ target }) =>
              onChange({ backgroundColor: target.value })
            }
          />
        </Field>
        <Field label="Text">
          <ColorInput
            value={textColor}
            onChange={({ target }) => onChange({ textColor: target.value })}
          />
        </Field>
      </div>
    </Popover>
  )
}
