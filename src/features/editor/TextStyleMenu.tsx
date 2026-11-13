import { useEditorState, type Editor } from '@tiptap/react'
import { ActionList, Chevron, MenuItem, Popover } from '../../design-system'
import { TextStylePreview } from '../../text-styles'
import { formatShortcut } from '../../utils/shortcuts'
import { editorSupports } from './formattingActions'
import {
  applyTextStyle,
  BODY_STYLE,
  getActiveTextStyle,
  TEXT_STYLES,
} from './textStyles'

/*
 * Body first (the everyday style), then the rest largest first. The order for
 * stepping with ⇧⌘> / ⇧⌘< is TEXT_STYLES.
 */
const MENU_STYLES = [
  BODY_STYLE,
  ...TEXT_STYLES.toReversed().filter((textStyle) => textStyle !== BODY_STYLE),
]

/**
 * The current paragraph's style. The toolbar shows just its icon; the menu
 * repeats that icon beside each spelled-out name, shown at its size.
 */
export function TextStyleMenu({ editor }: { editor: Editor }) {
  // Off where there are no paragraph styles, e.g. in the title.
  const isAvailable = editorSupports(editor, 'heading')
  const activeStyle = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => getActiveTextStyle(currentEditor),
  })
  const { icon: ActiveIcon, label: activeLabel } = activeStyle

  return (
    <Popover
      label={`Text style: ${activeLabel} (${formatShortcut('Mod-Shift->')} / ${formatShortcut('Mod-Shift-<')} to change)`}
      isTriggerIconOnly={false}
      isDisabled={!isAvailable}
      trigger={
        <>
          <ActiveIcon aria-hidden="true" />
          <Chevron />
        </>
      }
      // Back to the text, so writing continues in the new style.
      onClose={() => editor.commands.focus()}
    >
      {(close) => (
        <ActionList>
          {MENU_STYLES.map((textStyle) => {
            const { name, label, icon: Icon, shortcut } = textStyle
            return (
              <MenuItem
                key={name}
                isSelected={name === activeStyle.name}
                shortcut={shortcut}
                onClick={() => {
                  applyTextStyle(editor, textStyle)
                  close()
                }}
              >
                <Icon aria-hidden="true" />
                <TextStylePreview name={name}>{label}</TextStylePreview>
              </MenuItem>
            )
          })}
        </ActionList>
      )}
    </Popover>
  )
}
