import { UnfoldVertical } from 'lucide-react'
import { ChoiceGroup, Field, Popover } from '../../design-system'
import {
  LINE_SPACING_OPTIONS,
  PARAGRAPH_SPACING_OPTIONS,
  type Appearance,
  type LineSpacingValue,
  type ParagraphSpacingValue,
} from './appearanceOptions'
import styles from './AppearanceControls.module.css'

type SpacingPickerProps = {
  lineSpacing: LineSpacingValue
  paragraphSpacing: ParagraphSpacingValue
  onChange: (changes: Partial<Appearance>) => void
}

/** Page-wide vertical spacing: between lines, and between paragraphs. */
export function SpacingPicker({
  lineSpacing,
  paragraphSpacing,
  onChange,
}: SpacingPickerProps) {
  return (
    <Popover label="Spacing" trigger={<UnfoldVertical aria-hidden="true" />}>
      <div className={styles.panel}>
        <Field label="Line spacing" isGroup>
          <ChoiceGroup
            choices={LINE_SPACING_OPTIONS}
            selectedValue={lineSpacing}
            onSelect={(value) => onChange({ lineSpacing: value })}
          />
        </Field>
        <Field label="Paragraph spacing" isGroup>
          <ChoiceGroup
            choices={PARAGRAPH_SPACING_OPTIONS}
            selectedValue={paragraphSpacing}
            onSelect={(value) => onChange({ paragraphSpacing: value })}
          />
        </Field>
      </div>
    </Popover>
  )
}
