import { useId, type ReactNode } from 'react'
import styles from './ChoiceGroup.module.css'

type Choice<Value extends string> = {
  value: Value
  label: string
  /** Optional visual shown instead of the label text; the label stays as the accessible name. */
  visual?: ReactNode
}

type ChoiceGroupProps<Value extends string> = {
  choices: readonly Choice<Value>[]
  selectedValue: Value | null
  onSelect: (value: Value) => void
  layout?: 'segmented' | 'list'
}

/** Single-select group backed by native radio inputs for keyboard and screen reader support. */
export function ChoiceGroup<Value extends string>({
  choices,
  selectedValue,
  onSelect,
  layout = 'segmented',
}: ChoiceGroupProps<Value>) {
  const groupName = useId()
  return (
    <div className={`${styles.group} ${styles[layout]}`}>
      {choices.map(({ value, label, visual }) => (
        <label key={value} className={styles.choice} title={label}>
          <input
            type="radio"
            className={styles.input}
            name={groupName}
            value={value}
            checked={value === selectedValue}
            onChange={() => onSelect(value)}
          />
          {visual ? (
            <>
              <span aria-hidden="true" className={styles.visual}>
                {visual}
              </span>
              <span className="visually-hidden">{label}</span>
            </>
          ) : (
            label
          )}
        </label>
      ))}
    </div>
  )
}
