import { useState } from 'react'
import { parseTypedColor } from '../../lib/typedColor'
import styles from './ColorPicker.module.css'
import { TextInput } from './TextInput'

type TypedColorFieldProps = {
  label: string
  color: string
  allowsTransparency: boolean
  /** A valid typed color, once confirmed (Enter or leaving the field). */
  onChange: (color: string) => void
}

/**
 * The color as hex, which can be typed over in any CSS form. While typing,
 * the field holds the draft; Enter or leaving applies it if it's a color,
 * otherwise the field goes back to the current color.
 */
export function TypedColorField({
  label,
  color,
  allowsTransparency,
  onChange,
}: TypedColorFieldProps) {
  const [draft, setDraft] = useState<string | null>(null)

  function applyDraft() {
    if (draft === null) return
    const typedColor = parseTypedColor(draft, allowsTransparency)
    if (typedColor && typedColor !== color) onChange(typedColor)
    setDraft(null)
  }

  return (
    <TextInput
      className={styles.typedColor}
      aria-label={`${label} value`}
      title="Hex, rgb() or hsl()"
      spellCheck={false}
      autoComplete="off"
      value={draft ?? color}
      onChange={({ target }) => setDraft(target.value)}
      onKeyDown={(event) => {
        if (event.key !== 'Enter') return
        event.preventDefault()
        applyDraft()
      }}
      onBlur={applyDraft}
    />
  )
}
