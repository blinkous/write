import { ChevronDown } from 'lucide-react'
import { ChoiceGroup, Popover } from '../../design-system'
import { FONT_OPTIONS, type FontValue } from './fontOptions'
import styles from './FontPicker.module.css'

type FontPickerProps = {
  font: FontValue
  onChange: (font: FontValue) => void
}

/* Each font's name is shown in that font so the list doubles as a preview. */
const FONT_CHOICES = FONT_OPTIONS.map(({ value, label, family }) => ({
  value,
  label,
  visual: (
    <span className={styles.fontPreview} style={{ fontFamily: family }}>
      {label}
    </span>
  ),
}))

export function FontPicker({ font, onChange }: FontPickerProps) {
  const selectedFont =
    FONT_OPTIONS.find(({ value }) => value === font) ?? FONT_OPTIONS[0]
  return (
    <Popover
      label={`Font: ${selectedFont.label}`}
      isTriggerIconOnly={false}
      align="start"
      trigger={
        <>
          <span
            className={styles.fontTrigger}
            style={{ fontFamily: selectedFont.family }}
          >
            {selectedFont.label}
          </span>
          <ChevronDown aria-hidden="true" className={styles.chevron} />
        </>
      }
    >
      <ChoiceGroup
        label="Font"
        choices={FONT_CHOICES}
        selectedValue={font}
        onSelect={onChange}
      />
    </Popover>
  )
}
