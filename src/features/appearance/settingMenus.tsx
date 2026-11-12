import { MoveHorizontal, UnfoldVertical } from 'lucide-react'
import {
  ActionList,
  ChoiceGroup,
  Divider,
  MenuItem,
  Popover,
} from '../../design-system'
import {
  LINE_SPACING_OPTIONS,
  MARGIN_OPTIONS,
  type Appearance,
  type LineSpacingValue,
  type MarginValue,
} from './appearanceOptions'
import { OptionMenu } from './OptionMenu'

type SettingMenuProps<Value extends string> = {
  value: Value
  onChange: (value: Value) => void
}

export function MarginsMenu(props: SettingMenuProps<MarginValue>) {
  return (
    <OptionMenu
      label="Margins"
      icon={MoveHorizontal}
      options={MARGIN_OPTIONS}
      {...props}
    />
  )
}

type SpacingMenuProps = {
  lineSpacing: LineSpacingValue
  hasParagraphSpacing: boolean
  hasParagraphIndent: boolean
  onChange: (changes: Partial<Appearance>) => void
}

/** Line spacing, then (after a separator) actions to add or remove the paragraph gap and indent. */
export function SpacingMenu({
  lineSpacing,
  hasParagraphSpacing,
  hasParagraphIndent,
  onChange,
}: SpacingMenuProps) {
  const lineLabel =
    LINE_SPACING_OPTIONS.find(({ value }) => value === lineSpacing)?.label ?? ''
  const onOff = (isOn: boolean) => (isOn ? 'on' : 'off')
  return (
    <Popover
      label={`Spacing: ${lineLabel} line spacing, paragraph gap ${onOff(hasParagraphSpacing)}, indent ${onOff(hasParagraphIndent)}`}
      trigger={<UnfoldVertical aria-hidden="true" />}
    >
      <ChoiceGroup
        label="Line spacing"
        choices={LINE_SPACING_OPTIONS}
        selectedValue={lineSpacing}
        onSelect={(value) => onChange({ lineSpacing: value })}
      />
      <Divider orientation="horizontal" />
      {/* Action labels that flip with the state, like word processors, so these read as options, not menus. */}
      <ActionList>
        <MenuItem
          onClick={() =>
            onChange({ hasParagraphSpacing: !hasParagraphSpacing })
          }
        >
          {hasParagraphSpacing ? 'Remove paragraph gap' : 'Add paragraph gap'}
        </MenuItem>
        <MenuItem
          onClick={() => onChange({ hasParagraphIndent: !hasParagraphIndent })}
        >
          {hasParagraphIndent
            ? 'Remove paragraph indent'
            : 'Add paragraph indent'}
        </MenuItem>
      </ActionList>
    </Popover>
  )
}
