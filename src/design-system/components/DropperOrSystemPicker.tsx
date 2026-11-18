import { Palette, Pipette } from 'lucide-react'
import { useEffect, useRef } from 'react'
import {
  canPickScreenColor,
  pickScreenColor,
} from '../../lib/screenColorPicker'
import { removeTransparency } from '../../utils/color'
import { Button } from './Button'
import styles from './ColorPicker.module.css'

type DropperOrSystemPickerProps = {
  color: string
  allowsTransparency: boolean
  onChange: (color: string) => void
  onChangeEnd?: () => void
}

/** #rrggbbaa's "aa" (or nothing), so a picked color keeps the current transparency. */
function getAlphaSuffix(color: string, allowsTransparency: boolean): string {
  return allowsTransparency ? color.slice(removeTransparency(color).length) : ''
}

/**
 * A dropper that picks a color from anywhere on the screen where the browser
 * can (Chromium). Elsewhere nothing can start one directly, so it's a palette
 * opening the system color picker instead, whose own dropper is a click away
 * (macOS, iOS). Either way the current transparency is kept.
 */
export function DropperOrSystemPicker(props: DropperOrSystemPickerProps) {
  return canPickScreenColor() ? (
    <ScreenDropper {...props} />
  ) : (
    <SystemPickerDropper {...props} />
  )
}

function ScreenDropper({
  color,
  allowsTransparency,
  onChange,
  onChangeEnd,
}: DropperOrSystemPickerProps) {
  const label = 'Pick a color from the screen'
  return (
    <Button
      iconOnly
      aria-label={label}
      title={label}
      onClick={async () => {
        const pickedColor = await pickScreenColor()
        if (!pickedColor) return
        onChange(`${pickedColor}${getAlphaSuffix(color, allowsTransparency)}`)
        onChangeEnd?.()
      }}
    >
      <Pipette aria-hidden="true" />
    </Button>
  )
}

/** Opens a color input's picker; browsers without showPicker() get a click instead. */
function openSystemPicker(input: HTMLInputElement) {
  try {
    input.showPicker()
  } catch {
    input.click()
  }
}

function SystemPickerDropper({
  color,
  allowsTransparency,
  onChange,
  onChangeEnd,
}: DropperOrSystemPickerProps) {
  const label = 'Open the system color picker'
  const inputRef = useRef<HTMLInputElement>(null)
  const onChangeEndRef = useRef(onChangeEnd)

  useEffect(() => {
    onChangeEndRef.current = onChangeEnd
  })

  // React's onChange is the "input" event, so listen for the native "change" (the pick is done) directly.
  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    const handleChange = () => onChangeEndRef.current?.()
    input.addEventListener('change', handleChange)
    return () => input.removeEventListener('change', handleChange)
  }, [])

  return (
    <div className={styles.systemPicker}>
      <Button
        iconOnly
        aria-label={label}
        title={label}
        onClick={() => inputRef.current && openSystemPicker(inputRef.current)}
      >
        <Palette aria-hidden="true" />
      </Button>
      {/*
       * Invisible, under the button, so the system picker opens beside it.
       * Out of the tab order: WebKit never lets the keyboard reach color
       * inputs, so the button stands in for it.
       */}
      <input
        ref={inputRef}
        type="color"
        className={styles.colorInput}
        // Color inputs only take #rrggbb.
        value={removeTransparency(color)}
        tabIndex={-1}
        aria-hidden="true"
        onChange={({ target }) =>
          onChange(
            `${target.value}${getAlphaSuffix(color, allowsTransparency)}`,
          )
        }
      />
    </div>
  )
}
