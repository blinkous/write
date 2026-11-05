import { MoveHorizontal } from 'lucide-react'
import { ChoiceGroup, Field, Popover } from '../../design-system'
import { MARGIN_OPTIONS, type MarginValue } from './appearanceOptions'

type MarginsPickerProps = {
  margins: MarginValue
  onChange: (margins: MarginValue) => void
}

export function MarginsPicker({ margins, onChange }: MarginsPickerProps) {
  const { label } =
    MARGIN_OPTIONS.find(({ value }) => value === margins) ?? MARGIN_OPTIONS[1]
  return (
    <Popover
      label={`Margins: ${label}`}
      trigger={<MoveHorizontal aria-hidden="true" />}
    >
      <Field label="Margins" isGroup>
        <ChoiceGroup
          choices={MARGIN_OPTIONS}
          selectedValue={margins}
          onSelect={onChange}
        />
      </Field>
    </Popover>
  )
}
