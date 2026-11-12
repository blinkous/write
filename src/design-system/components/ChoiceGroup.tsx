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
  /**
   * A choice was made on purpose: clicked, or Enter / Space. Arrow keys only
   * select (previewing live), so a menu can close here without closing on arrows.
   */
  onChoose?: () => void
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
  onChoose,
}: ChoiceGroupProps<Value>) {
  const groupName = useId()
  return (
    <div role="radiogroup" aria-label={label} className={styles.group}>
      {choices.map(({ value, label: choiceLabel, visual }) => (
        <label
          key={value}
          className={`${menuItemStyles.item} ${styles.choice}`}
          data-selected={value === selectedValue}
          // A real click on the row has a click count; the clicks arrow keys make on the
          // radio (bubbling here) don't. Handled on the row, since WebKit forwards a
          // click on the row's text to the radio without a count.
          onClick={({ detail }) => {
            if (detail > 0) onChoose?.()
          }}
        >
          <input
            type="radio"
            className={styles.input}
            name={groupName}
            value={value}
            checked={value === selectedValue}
            onChange={() => onSelect(value)}
            onKeyDown={({ key }) => {
              if (key !== 'Enter' && key !== ' ') return
              onSelect(value)
              onChoose?.()
            }}
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
