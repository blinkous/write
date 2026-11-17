import type { ReactNode } from 'react'
import { SelectMenu, Text } from '../design-system'
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
  /** Keeps the trigger one width whatever the font (e.g. in the toolbar). */
  hasFixedWidth?: boolean
}

/* Each name is shown in its own font, so the list doubles as a preview. */
function preview(label: string, family: string) {
  return (
    <span className={styles.fontPreview} style={{ fontFamily: family }}>
      {label}
    </span>
  )
}

/** "Default" above a caption naming the font it currently means. */
function captionDefault(
  defaultName: ReactNode,
  fontLabel: string,
  className = styles.captionedDefault,
) {
  return (
    <span className={className}>
      {defaultName}
      <Text as="span" variant="caption">
        {fontLabel}
      </Text>
    </span>
  )
}

/** "Default", in the default font, captioned with that font's name. */
function getDefaultChoice({ label, family }: FontOption) {
  return {
    value: DEFAULT_CHOICE,
    label: `Default (${label})`,
    visual: captionDefault(preview('Default', family), label),
  }
}

/** A trigger showing the font in use (in that font), opening a list of fonts previewed in themselves. */
export function FontMenu({
  label,
  value,
  defaultFont,
  onChange,
  onClose,
  hasFixedWidth,
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

  /* The font in use, in itself; on Default, captioned with its name (as in the list) within the control's height. */
  function getTriggerContent() {
    if (!isDefault) {
      return (
        <span style={{ fontFamily: shownFont.family }}>{shownFont.label}</span>
      )
    }
    return captionDefault(
      <span style={{ fontFamily: shownFont.family }}>Default</span>,
      shownFont.label,
      `${styles.captionedDefault} ${styles.captionedDefaultOnTrigger}`,
    )
  }

  return (
    <SelectMenu
      label={label}
      choices={choices}
      value={isDefault ? DEFAULT_CHOICE : shownFont.value}
      onChange={(choice) => onChange(isFontValue(choice) ? choice : null)}
      onClose={onClose}
      triggerContent={getTriggerContent()}
      hasFixedWidth={hasFixedWidth}
    />
  )
}
