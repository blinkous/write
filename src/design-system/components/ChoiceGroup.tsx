import { useId, type ReactNode } from 'react'
import menuItemStyles from './MenuItem.module.css'
import styles from './ChoiceGroup.module.css'

type Choice<Value extends string> = {
  value: Value
  label: string
  /** Optional visual shown instead of the label text; the label stays as the accessible name. */
  visual?: ReactNode
}

type ChoiceGroupProps<Value extends string> = {
  /** Accessible name for the group; not shown (the menu's trigger names it visually). */
  label: string
  choices: readonly Choice<Value>[]
  selectedValue: Value | null
  onSelect: (value: Value) => void
}

/**
 * Single-select list of menu rows, backed by native radio inputs for keyboard
 * (arrow keys) and screen reader support.
 */
export function ChoiceGroup<Value extends string>({
  label,
  choices,
  selectedValue,
  onSelect,
}: ChoiceGroupProps<Value>) {
  const groupName = useId()
  return (
    <div role="radiogroup" aria-label={label} className={styles.group}>
      {choices.map(({ value, label: choiceLabel, visual }) => (
        <label
          key={value}
          className={`${menuItemStyles.item} ${styles.choice}`}
          data-selected={value === selectedValue}
        >
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
              <span className="visually-hidden">{choiceLabel}</span>
            </>
          ) : (
            choiceLabel
          )}
        </label>
      ))}
    </div>
  )
}
