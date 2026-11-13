import type { ReactNode } from 'react'
import { Chevron } from './Chevron'
import { ChoiceGroup } from './ChoiceGroup'
import { Popover } from './Popover'
import styles from './SelectMenu.module.css'

type Choice<Value extends string> = {
  value: Value
  label: string
  /** Shown in the list instead of the label (which stays the accessible name), e.g. a preview. */
  visual?: ReactNode
}

type SelectMenuProps<Value extends string> = {
  /** Names the setting, e.g. "Size"; the trigger's accessible name adds the current choice. */
  label: string
  choices: readonly Choice<Value>[]
  value: Value
  onChange: (value: Value) => void
  /** What the trigger shows for the current choice; its label by default. */
  triggerContent?: ReactNode
  onClose?: () => void
}

/**
 * A text trigger showing the current choice with a chevron, opening a
 * pick-one list that closes on a choice (arrow keys preview without closing).
 */
export function SelectMenu<Value extends string>({
  label,
  choices,
  value,
  onChange,
  triggerContent,
  onClose,
}: SelectMenuProps<Value>) {
  const currentLabel =
    choices.find((choice) => choice.value === value)?.label ?? ''
  return (
    <Popover
      label={`${label}: ${currentLabel}`}
      isTriggerIconOnly={false}
      align="start"
      onClose={onClose}
      trigger={
        <>
          <span className={styles.trigger}>
            {triggerContent ?? currentLabel}
          </span>
          <Chevron />
        </>
      }
    >
      {(close) => (
        <ChoiceGroup
          label={label}
          choices={choices}
          selectedValue={value}
          onSelect={onChange}
          onChoose={close}
        />
      )}
    </Popover>
  )
}
