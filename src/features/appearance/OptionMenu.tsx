import type { LucideIcon } from 'lucide-react'
import { ChoiceGroup, Popover } from '../../design-system'

type Option<Value extends string> = { value: Value; label: string }

type OptionMenuProps<Value extends string> = {
  /** Names the setting, e.g. "Text size"; the trigger's accessible name adds the value. */
  label: string
  icon: LucideIcon
  options: readonly Option<Value>[]
  value: Value
  onChange: (value: Value) => void
}

/** A toolbar icon that opens a list of choices for one page setting. */
export function OptionMenu<Value extends string>({
  label,
  icon: Icon,
  options,
  value,
  onChange,
}: OptionMenuProps<Value>) {
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? ''
  return (
    <Popover
      label={`${label}: ${selectedLabel}`}
      trigger={<Icon aria-hidden="true" />}
    >
      {(close) => (
        <ChoiceGroup
          label={label}
          choices={options}
          selectedValue={value}
          onSelect={onChange}
          onChoose={close}
        />
      )}
    </Popover>
  )
}
