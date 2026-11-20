import type { Editor } from '@tiptap/react'
import { ActionList, MenuItem, Popover } from '../../design-system'
import { useShownShortcuts } from '../../keyboard-shortcuts'
import { readOwnAlignment } from './ownFormatting'
import { useOwnAndStyleValue, type TextStyleContext } from './ownOrStyleValue'
import {
  chooseTextAlignment,
  getTextAlignmentOption,
  TEXT_ALIGNMENT_OPTIONS,
} from './textAlignmentOptions'

/**
 * Lines up the selected blocks (or the cursor's), a selected picture
 * included: left, center or right. Its icon shows the alignment in effect,
 * the text's own or its style's.
 */
export function TextAlignmentPicker({
  editor,
  ...textStyleContext
}: TextStyleContext & { editor: Editor }) {
  const getShortcut = useShownShortcuts()
  const { own, style } = useOwnAndStyleValue(
    editor,
    textStyleContext,
    'alignment',
    readOwnAlignment,
  )
  const shown = getTextAlignmentOption(own ?? style)
  const { icon: ShownIcon } = shown

  return (
    <Popover
      label={`Alignment: ${shown.label.toLowerCase()}`}
      trigger={<ShownIcon aria-hidden="true" />}
      // Return to the text with its selection.
      onClose={() => editor.commands.focus()}
    >
      {(close) => (
        <ActionList>
          {TEXT_ALIGNMENT_OPTIONS.map(({ value, label, icon, shortcutId }) => (
            <MenuItem
              key={value}
              icon={icon}
              shortcut={getShortcut(shortcutId)}
              isSelected={shown.value === value}
              onClick={() => {
                chooseTextAlignment(editor, value, style)
                close()
              }}
            >
              {label}
            </MenuItem>
          ))}
        </ActionList>
      )}
    </Popover>
  )
}
