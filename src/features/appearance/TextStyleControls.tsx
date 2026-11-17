import { Bold, Italic, RotateCcw, Strikethrough, Underline } from 'lucide-react'
import {
  Button,
  LabeledRow,
  NumberStepper,
  PopoverPanel,
} from '../../design-system'
import { FontMenu } from '../../fonts'
import {
  DEFAULT_TEXT_STYLES,
  GlowColorMenu,
  TEXT_STYLE_LABELS,
  TEXT_STYLE_LETTER_SPACING_RANGE,
  TEXT_STYLE_SIZE_RANGE,
  TextCaseMenu,
  TextColorMenu,
  type TextStyleName,
} from '../../text-styles'
import type { CustomTextColors } from './appearanceOptions'
import type { usePageTheme } from './usePageTheme'
import styles from './TextStyleControls.module.css'

export type TextStyleControlsProps = {
  name: TextStyleName
  pageTheme: ReturnType<typeof usePageTheme>
  customTextColors: CustomTextColors
  onCustomTextColorsChange: (customTextColors: (string | null)[]) => void
}

/* Toggles in the toolbar's look and order. */
const STYLE_TOGGLES = [
  { key: 'bold', label: 'Bold', icon: Bold },
  { key: 'italic', label: 'Italic', icon: Italic },
  { key: 'underline', label: 'Underline', icon: Underline },
  { key: 'strike', label: 'Strikethrough', icon: Strikethrough },
] as const

/**
 * Everything a text style sets, in the toolbar's order (font, size, color, the
 * emphasis toggles, glow, case, letter spacing), with a reset for the style.
 * `refocus` comes from the popover holding it, so focus moves on once the
 * reset turns itself off.
 */
export function TextStyleControls({
  name,
  pageTheme,
  customTextColors,
  onCustomTextColorsChange,
  refocus,
}: TextStyleControlsProps & { refocus: () => void }) {
  const {
    textStyles,
    editorFont,
    textColor,
    changeTextStyle,
    resetTextStyle,
    commit,
  } = pageTheme
  const label = TEXT_STYLE_LABELS[name]
  const settings = textStyles[name]
  const isDefault =
    JSON.stringify(settings) === JSON.stringify(DEFAULT_TEXT_STYLES[name])

  return (
    <PopoverPanel width="regular">
      <LabeledRow label="Font" control="button">
        <FontMenu
          label={`${label} font`}
          value={settings.font}
          defaultFont={editorFont}
          onChange={(font) => changeTextStyle(name, { font })}
        />
      </LabeledRow>
      <LabeledRow label="Size" control="icon">
        <NumberStepper
          label={`${label} size`}
          value={settings.size}
          min={TEXT_STYLE_SIZE_RANGE.min}
          max={TEXT_STYLE_SIZE_RANGE.max}
          unit="px"
          onChange={(size) => changeTextStyle(name, { size })}
        />
      </LabeledRow>
      <LabeledRow label="Color" control="icon">
        <TextColorMenu
          label={`${label} color`}
          value={settings.color}
          pageTextColor={textColor}
          customColors={customTextColors}
          onCustomColorsChange={onCustomTextColorsChange}
          onSelect={(color) => changeTextStyle(name, { color })}
          // A drag in the system picker previews live and becomes one undo step when it ends.
          onPick={(color) => changeTextStyle(name, { color }, false)}
          onPickEnd={commit}
        />
      </LabeledRow>
      {/* The toolbar's emphasis toggles in a line of their own; reset at its end. */}
      <div className={styles.formatting}>
        <div
          role="group"
          aria-label={`${label} formatting`}
          className={styles.toggles}
        >
          {STYLE_TOGGLES.map(({ key, label: toggleLabel, icon: Icon }) => (
            <Button
              key={key}
              iconOnly
              aria-label={toggleLabel}
              title={toggleLabel}
              aria-pressed={settings[key]}
              onClick={() => changeTextStyle(name, { [key]: !settings[key] })}
            >
              <Icon aria-hidden="true" />
            </Button>
          ))}
        </div>
        <Button
          iconOnly
          className={styles.resetStyle}
          aria-label={`Reset ${label.toLowerCase()} style`}
          title={`Reset ${label.toLowerCase()} style`}
          disabled={isDefault}
          onClick={() => {
            // It turns off once reset, so focus moves on rather than being lost.
            refocus()
            resetTextStyle(name)
          }}
        >
          <RotateCcw aria-hidden="true" />
        </Button>
      </div>
      <LabeledRow label="Glow" control="icon">
        <GlowColorMenu
          label={`${label} glow`}
          value={settings.glow}
          pageTextColor={textColor}
          customColors={customTextColors}
          onCustomColorsChange={onCustomTextColorsChange}
          onSelect={(glow) => changeTextStyle(name, { glow })}
          onPick={(glow) => changeTextStyle(name, { glow }, false)}
          onPickEnd={commit}
        />
      </LabeledRow>
      <LabeledRow label="Case" control="icon">
        <TextCaseMenu
          label={`${label} case`}
          value={settings.textCase}
          onSelect={(textCase) => changeTextStyle(name, { textCase })}
        />
      </LabeledRow>
      <LabeledRow label="Letter spacing" control="icon">
        <NumberStepper
          label={`${label} letter spacing`}
          value={settings.letterSpacing}
          min={TEXT_STYLE_LETTER_SPACING_RANGE.min}
          max={TEXT_STYLE_LETTER_SPACING_RANGE.max}
          unit="%"
          onChange={(letterSpacing) => changeTextStyle(name, { letterSpacing })}
        />
      </LabeledRow>
    </PopoverPanel>
  )
}
