import { Button, LabeledRow, Popover } from '../../design-system'
import { FontMenu } from '../../fonts'
import {
  DEFAULT_TEXT_STYLES,
  TEXT_STYLE_LABELS,
  TEXT_STYLE_NAMES,
  TextStylePreview,
} from '../../text-styles'
import type { CustomTextColors } from './appearanceOptions'
import {
  TextStyleControls,
  type TextStyleControlsProps,
} from './TextStyleControls'
import type { usePageTheme } from './usePageTheme'
import styles from './TextStyleSettings.module.css'

type PageTheme = ReturnType<typeof usePageTheme>

/** One style: its name drawn in the style, the whole row opening its controls beside it, so every change shows in the row right away. */
function TextStyleRow(props: TextStyleControlsProps) {
  const { name } = props
  const label = TEXT_STYLE_LABELS[name]
  return (
    <Popover
      label={`${label} style`}
      isTriggerIconOnly={false}
      triggerVariant="row"
      placement="beside"
      trigger={<TextStylePreview name={name}>{label}</TextStylePreview>}
    >
      {(_close, refocus) => <TextStyleControls {...props} refocus={refocus} />}
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
