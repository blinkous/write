import { useEditorState, type Editor } from '@tiptap/react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  ActionList,
  Chevron,
  MenuActionRow,
  MenuItem,
  Popover,
} from '../../design-system'
import { TextStylePreview, type TextStyleName } from '../../text-styles'
import { formatShortcut } from '../../utils/shortcuts'
import {
  applyTextStyle,
  BODY_STYLE,
  getActiveTextStyle,
  TEXT_STYLES,
  TITLE_STYLE,
} from './textStyles'

/*
 * Body first (the everyday style), then the rest largest first. The order for
 * stepping with ⇧⌘> / ⇧⌘< is TEXT_STYLES.
 */
const MENU_STYLES = [
  BODY_STYLE,
  ...TEXT_STYLES.toReversed().filter((textStyle) => textStyle !== BODY_STYLE),
]

type TextStyleMenuProps = {
  editor: Editor
  /** The title editor has one style, Title, so the menu lists just that. */
  isTitle: boolean
  /** A style's edit control, at the end of its row (the app supplies it, as styles live in appearance). */
  renderStyleEdit: (name: TextStyleName) => ReactNode
}

type StyleRowProps = {
  name: TextStyleName
  label: string
  icon: LucideIcon
  shortcut?: string
  isSelected: boolean
  onSelect: () => void
  editControl: ReactNode
}

/** A style's name, drawn in the style, that picks it; its edit control at the end. */
function StyleRow({
  name,
  label,
  icon: Icon,
  shortcut,
  isSelected,
  onSelect,
  editControl,
}: StyleRowProps) {
  return (
    <MenuActionRow action={editControl}>
      <MenuItem isSelected={isSelected} shortcut={shortcut} onClick={onSelect}>
        <Icon aria-hidden="true" />
        <TextStylePreview name={name}>{label}</TextStylePreview>
      </MenuItem>
    </MenuActionRow>
  )
}

/**
 * The current paragraph's style. The toolbar shows just its icon; the menu
 * repeats that icon beside each spelled-out name, shown in its style. A row
 * applies its style; the edit control at its end changes how the style looks.
 * In the title the menu lists just Title, to edit it.
 */
export function TextStyleMenu({
  editor,
  isTitle,
  renderStyleEdit,
}: TextStyleMenuProps) {
  const activeStyle = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) =>
      isTitle ? TITLE_STYLE : getActiveTextStyle(currentEditor),
  })
  const { icon: ActiveIcon, label: activeLabel } = activeStyle
  const stepHint = isTitle
    ? ''
    : ` (${formatShortcut('Mod-Shift->')} / ${formatShortcut('Mod-Shift-<')} to change)`

  return (
    <Popover
      label={`Text style: ${activeLabel}${stepHint}`}
      isTriggerIconOnly={false}
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
          {isTitle ? (
            <StyleRow
              {...TITLE_STYLE}
              isSelected
              onSelect={close}
              editControl={renderStyleEdit(TITLE_STYLE.name)}
            />
          ) : (
            MENU_STYLES.map((textStyle) => (
              <StyleRow
                key={textStyle.name}
                {...textStyle}
                isSelected={textStyle.name === activeStyle.name}
                onSelect={() => {
                  applyTextStyle(editor, textStyle)
                  close()
                }}
                editControl={renderStyleEdit(textStyle.name)}
              />
            ))
          )}
        </ActionList>
      )}
    </Popover>
  )
}
