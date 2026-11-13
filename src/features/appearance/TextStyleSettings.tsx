import { Bold, Italic, Pencil, Strikethrough, Underline } from 'lucide-react'
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
  TEXT_STYLE_LABELS,
  TEXT_STYLE_NAMES,
  TEXT_STYLE_LETTER_SPACING_RANGE,
  TEXT_STYLE_SIZE_RANGE,
  TextColorMenu,
  type TextStyleName,
} from '../../text-styles'
import type { CustomTextColors } from './appearanceOptions'
import { PageColorSettings } from './ThemeSettings'
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
 * One style: its name, with an edit button opening the same controls as the
 * toolbar (bold, italic, underline, strikethrough, color), then its font and
 * size, then letter spacing.
 */
function TextStyleRow({
  name,
  pageTheme,
  customTextColors,
  onCustomTextColorsChange,
}: TextStyleRowProps) {
  const { textStyles, editorFont, textColor, changeTextStyle, commit } =
    pageTheme
  const label = TEXT_STYLE_LABELS[name]
  const settings = textStyles[name]

  return (
    <LabeledRow label={label} control="icon">
      <Popover
        label={`Edit ${label.toLowerCase()} style`}
        align="end"
        trigger={<Pencil aria-hidden="true" />}
      >
        <PopoverPanel width="regular">
          <div className={styles.controls}>
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
          </div>
          <div className={styles.controls}>
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
          <div className={styles.controls}>
            <span>Letter spacing</span>
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
          </div>
        </PopoverPanel>
      </Popover>
    </LabeledRow>
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

/** Everything around the page: its font, and the page's background and text colors. */
export function AppSettings({ pageTheme }: { pageTheme: PageTheme }) {
  const { appFont, changeFonts } = pageTheme
  return (
    <>
      <LabeledRow label="Font" control="button">
        <FontMenu
          label="App font"
          value={appFont}
          onChange={(nextFont) =>
            nextFont && changeFonts({ appFont: nextFont })
          }
        />
      </LabeledRow>
      <PageColorSettings pageTheme={pageTheme} />
    </>
  )
}
