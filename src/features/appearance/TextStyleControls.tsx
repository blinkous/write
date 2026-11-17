import { Bold, Italic, RotateCcw, Strikethrough, Underline } from 'lucide-react'
import { Button, NumberStepper } from '../../design-system'
import { FontMenu } from '../../fonts'
import {
  DEFAULT_TEXT_STYLES,
  GlowColorMenu,
  LetterSpacingMenu,
  TEXT_STYLE_LABELS,
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
 * Everything a text style sets, as the toolbar's text group: the same
 * controls in the same order, then a reset for the whole style. Font and size
 * (the one control the toolbar lacks; style-only, see the root SPEC) share the
 * first line; the icons follow in two lines: color and the emphasis toggles,
 * then glow, case and letter spacing, with the reset at the bottom right (as
 * every panel's reset). `refocus`
 * comes from the popover holding it, so focus moves on once the reset turns
 * itself off.
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
  const defaults = DEFAULT_TEXT_STYLES[name]
  const isDefault = JSON.stringify(settings) === JSON.stringify(defaults)

  return (
    <div role="group" aria-label={`${label} style`} className={styles.strip}>
      <div className={styles.fontAndSize}>
        <FontMenu
          label={`${label} font`}
          value={settings.font}
          defaultFont={editorFont}
          onChange={(font) => changeTextStyle(name, { font })}
        />
        <NumberStepper
          label={`${label} size`}
          value={settings.size}
          min={TEXT_STYLE_SIZE_RANGE.min}
          max={TEXT_STYLE_SIZE_RANGE.max}
          unit="px"
          onChange={(size) => changeTextStyle(name, { size })}
        />
      </div>
      <div className={styles.line}>
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
      <div className={styles.line}>
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
        <TextCaseMenu
          label={`${label} case`}
          value={settings.textCase}
          onSelect={(textCase) => changeTextStyle(name, { textCase })}
        />
        <LetterSpacingMenu
          label={`${label} letter spacing`}
          value={settings.letterSpacing}
          onChange={(letterSpacing) => changeTextStyle(name, { letterSpacing })}
          onReset={() =>
            changeTextStyle(name, { letterSpacing: defaults.letterSpacing })
          }
          canReset={settings.letterSpacing !== defaults.letterSpacing}
        />
        <Button
          iconOnly
          className={styles.reset}
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
    </div>
  )
}
