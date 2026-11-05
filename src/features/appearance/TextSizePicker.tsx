import { ALargeSmall } from 'lucide-react'
import { ChoiceGroup, Field, Popover } from '../../design-system'
import { TEXT_SIZE_OPTIONS, type TextSizeValue } from './appearanceOptions'

type TextSizePickerProps = {
  textSize: TextSizeValue
  onChange: (textSize: TextSizeValue) => void
}

export function TextSizePicker({ textSize, onChange }: TextSizePickerProps) {
  const { label } =
    TEXT_SIZE_OPTIONS.find(({ value }) => value === textSize) ??
    TEXT_SIZE_OPTIONS[1]
  return (
    <Popover
      label={`Text size: ${label}`}
      trigger={<ALargeSmall aria-hidden="true" />}
    >
      <Field label="Text size" isGroup>
        <ChoiceGroup
          choices={TEXT_SIZE_OPTIONS}
          selectedValue={textSize}
          onSelect={onChange}
        />
      </Field>
    </Popover>
  )
}
