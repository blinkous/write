import { useId } from 'react'
import { ChoiceFieldset } from './ChoiceFieldset'
import styles from './FormChoice.module.css'

type RadioGroupProps<Value extends string> = {
  legend: string
  choices: readonly { value: Value; label: string }[]
  value: Value
  onChange: (value: Value) => void
}

/** Pick one, as native radios (arrow keys move between them). For menus, see ChoiceGroup. */
export function RadioGroup<Value extends string>({
  legend,
  choices,
  value,
  onChange,
}: RadioGroupProps<Value>) {
  const groupName = useId()
  return (
    <ChoiceFieldset legend={legend}>
      {choices.map((choice) => (
        <label key={choice.value} className={styles.choice}>
          <input
            type="radio"
            className={styles.input}
            name={groupName}
            value={choice.value}
            checked={choice.value === value}
            onChange={() => onChange(choice.value)}
          />
          {choice.label}
        </label>
      ))}
    </ChoiceFieldset>
  )
}
