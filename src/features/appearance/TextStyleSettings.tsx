import { Bold, Italic, RotateCcw, Strikethrough, Underline } from 'lucide-react'
import {
  Button,
  LabeledRow,
  NumberStepper,
  Popover,
  PopoverPanel,
} from '../../design-system'
import { FontMenu } from '../../fonts'
import {
  DEFAULT_TEXT_STYLES,
  GlowColorMenu,
  TEXT_STYLE_LABELS,
  TEXT_STYLE_NAMES,
  TEXT_STYLE_LETTER_SPACING_RANGE,
  TEXT_STYLE_SIZE_RANGE,
  TextCaseMenu,
  TextColorMenu,
  TextStylePreview,
  type TextStyleName,
} from '../../text-styles'
import type { CustomTextColors } from './appearanceOptions'
import type { usePageTheme } from './usePageTheme'
import styles from './TextStyleSettings.module.css'

type PageTheme = ReturnType<typeof usePageTheme>

type TextStyleRowProps = {
  name: TextStyleName
  pageTheme: PageTheme
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
 * One style: its name drawn in the style, the whole row opening its controls
 * beside it in the toolbar's order (font, size, letter spacing, case, color,
 * glow, then the toggles), so every change shows in the row right away.
 */
function TextStyleRow({
  name,
  pageTheme,
  customTextColors,
  onCustomTextColorsChange,
}: TextStyleRowProps) {
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
    <Popover
      label={`${label} style`}
      isTriggerIconOnly={false}
      triggerVariant="row"
      placement="beside"
      trigger={<TextStylePreview name={name}>{label}</TextStylePreview>}
    >
      {(_close, refocus) => (
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
          <LabeledRow label="Letter spacing" control="icon">
            <NumberStepper
              label={`${label} letter spacing`}
              value={settings.letterSpacing}
              min={TEXT_STYLE_LETTER_SPACING_RANGE.min}
              max={TEXT_STYLE_LETTER_SPACING_RANGE.max}
              unit="%"
              onChange={(letterSpacing) =>
                changeTextStyle(name, { letterSpacing })
              }
            />
          </LabeledRow>
          <LabeledRow label="Case" control="icon">
            <TextCaseMenu
              label={`${label} case`}
              value={settings.textCase}
              onSelect={(textCase) => changeTextStyle(name, { textCase })}
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
          {/* The toolbar's toggles in a line of their own; reset at the end. */}
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
                  onClick={() =>
                    changeTextStyle(name, { [key]: !settings[key] })
                  }
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
        </PopoverPanel>
      )}
    </Popover>
  )
}

type EditorSettingsProps = {
  pageTheme: PageTheme
  customTextColors: CustomTextColors
  onCustomTextColorsChange: (customTextColors: (string | null)[]) => void
}

/** The editor's font (every style's default), how each text style looks, and one reset for all of it. */
export function EditorSettings({
  pageTheme,
  customTextColors,
  onCustomTextColorsChange,
}: EditorSettingsProps) {
  const { appFont, editorFont, textStyles, changeFonts, resetEditor } =
    pageTheme
  const isAllDefault =
    editorFont === appFont &&
    JSON.stringify(textStyles) === JSON.stringify(DEFAULT_TEXT_STYLES)
  return (
    <>
      <LabeledRow label="Font" control="button">
        <FontMenu
          label="Editor font"
          value={editorFont}
          onChange={(nextFont) =>
            nextFont && changeFonts({ editorFont: nextFont })
          }
        />
      </LabeledRow>
      {TEXT_STYLE_NAMES.map((name) => (
        <TextStyleRow
          key={name}
          name={name}
          pageTheme={pageTheme}
          customTextColors={customTextColors}
          onCustomTextColorsChange={onCustomTextColorsChange}
        />
      ))}
      <Button
        variant="ghost"
        className={styles.reset}
        disabled={isAllDefault}
        onClick={resetEditor}
      >
        Reset all styles
      </Button>
    </>
  )
}
