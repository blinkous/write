import { SelectMenu } from '../design-system'
import {
  FONT_OPTIONS,
  getFontOption,
  isFontValue,
  type FontOption,
  type FontValue,
} from './fontOptions'
import styles from './FontMenu.module.css'

/** Choice value for "follow the default font" (no font of its own). */
const DEFAULT_CHOICE = 'default'

type FontMenuProps = {
  /** Names the menu, e.g. "App font" or "Text font". */
  label: string
  /** The chosen font, or null for the default. */
  value: FontValue | null
  /** When given, a first "Default" option that follows this font. */
  defaultFont?: FontValue
  onChange: (value: FontValue | null) => void
  onClose?: () => void
}

/* Each name is shown in its own font, so the list doubles as a preview. */
function preview(label: string, family: string) {
  return (
    <span className={styles.fontPreview} style={{ fontFamily: family }}>
      {label}
    </span>
  )
}

/** "Default", in the default font, captioned with that font's name. */
function getDefaultChoice({ label, family }: FontOption) {
  return {
    value: DEFAULT_CHOICE,
    label: `Default (${label})`,
    visual: (
      <span className={styles.defaultChoice}>
        {preview('Default', family)}
        <span className={styles.caption}>{label}</span>
      </span>
    ),
  }
}

/** A trigger showing the font in use (in that font), opening a list of fonts previewed in themselves. */
export function FontMenu({
  label,
  value,
  defaultFont,
  onChange,
  onClose,
}: FontMenuProps) {
  const shownFont = getFontOption(value ?? defaultFont ?? FONT_OPTIONS[0].value)
  const isDefault = value === null && defaultFont !== undefined
  const choices = [
    ...(defaultFont ? [getDefaultChoice(getFontOption(defaultFont))] : []),
    ...FONT_OPTIONS.map((font) => ({
      value: font.value,
      label: font.label,
      visual: preview(font.label, font.family),
    })),
  ]

  return (
    <SelectMenu
      label={label}
      choices={choices}
      value={isDefault ? DEFAULT_CHOICE : shownFont.value}
      onChange={(choice) => onChange(isFontValue(choice) ? choice : null)}
      onClose={onClose}
      triggerContent={
        <span style={{ fontFamily: shownFont.family }}>
          {isDefault ? 'Default' : shownFont.label}
        </span>
      }
    />
  )
}
