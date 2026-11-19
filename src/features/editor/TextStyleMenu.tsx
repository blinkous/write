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
import type { FontValue } from '../../fonts'
import {
  DEFAULT_TEXT_STYLES,
  TextStylePreview,
  type TextStyleName,
  type TextStyleSettings,
} from '../../text-styles'
import {
  useShownShortcuts,
  type ShortcutCommandId,
} from '../../keyboard-shortcuts'
import { formatShortcut } from '../../utils/shortcuts'
import {
  applyTextStyle,
  BODY_STYLE,
  getActiveTextStyle,
  TEXT_STYLES,
  TITLE_STYLE,
  type TextStyle,
} from './textStyles'
import { matchTextToStyle } from './matchTextToStyle'
import { matchTextStyle } from './matchTextStyle'
import type { TextStyleContext } from './ownOrStyleValue'
import { TextStyleOptions } from './TextStyleOptions'

/*
 * Body first (the everyday style), then the rest largest first. The order for
 * stepping with ⇧⌘> / ⇧⌘< is TEXT_STYLES.
 */
const MENU_STYLES = [
  BODY_STYLE,
  ...TEXT_STYLES.toReversed().filter((textStyle) => textStyle !== BODY_STYLE),
]

type TextStyleMenuProps = TextStyleContext & {
  editor: Editor
  /** The entries' font, which text and styles without their own follow. */
  editorFont: FontValue
  onChangeTextStyle: (
    name: TextStyleName,
    changes: Partial<TextStyleSettings>,
  ) => void
  onResetTextStyle: (name: TextStyleName) => void
}

type StyleRowProps = {
  name: TextStyleName
  label: string
  icon: LucideIcon
  shortcutId?: ShortcutCommandId
  isSelected: boolean
  onSelect: () => void
  editControl: ReactNode
}

/** A style's name, drawn in the style, that picks it; its edit control at the end. */
function StyleRow({
  name,
  label,
  icon: Icon,
  shortcutId,
  isSelected,
  onSelect,
  editControl,
}: StyleRowProps) {
  const getShortcut = useShownShortcuts()
  return (
    <MenuActionRow action={editControl}>
      <MenuItem
        icon={Icon}
        isSelected={isSelected}
        shortcut={shortcutId && getShortcut(shortcutId)}
        onClick={onSelect}
      >
        <TextStylePreview name={name}>{label}</TextStylePreview>
      </MenuItem>
    </MenuActionRow>
  )
}

/**
 * The current paragraph's style. The toolbar shows just its icon; the menu
 * repeats that icon beside each spelled-out name, shown in its style. A row
 * applies its style; its ⋯ updates the style to match the selected text (or
 * the text to match the style), sets its size, or resets it.
 * In the title the menu lists just Title, to edit it.
 */
export function TextStyleMenu({
  editor,
  editorFont,
  onChangeTextStyle,
  onResetTextStyle,
  ...textStyleContext
}: TextStyleMenuProps) {
  const { isTitle, textStyles } = textStyleContext
  const activeStyle = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) =>
      isTitle ? TITLE_STYLE : getActiveTextStyle(currentEditor),
  })
  const { icon: ActiveIcon, label: activeLabel } = activeStyle
  const getShortcut = useShownShortcuts()
  const largerShortcut = getShortcut('larger-text-style')
  const smallerShortcut = getShortcut('smaller-text-style')
  const stepHint =
    isTitle || !largerShortcut || !smallerShortcut
      ? ''
      : ` (${formatShortcut(largerShortcut)} / ${formatShortcut(smallerShortcut)} to change)`

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
      {(close) => {
        /* A style's ⋯: matching closes the menu, back to the text, which now follows the style. */
        const renderOptions = (
          name: TextStyleName,
          label: string,
          /** The paragraph style to give the selection; null in the title, which has one style. */
          textStyle: TextStyle | null,
        ) => (
          <TextStyleOptions
            label={label}
            onMatch={() => {
              matchTextStyle(
                editor,
                textStyleContext,
                editorFont,
                name,
                onChangeTextStyle,
              )
              close()
            }}
            onMatchText={() => {
              matchTextToStyle(editor, textStyle)
              close()
            }}
            size={textStyles[name].size}
            onSizeChange={(size) => onChangeTextStyle(name, { size })}
            canReset={
              JSON.stringify(textStyles[name]) !==
              JSON.stringify(DEFAULT_TEXT_STYLES[name])
            }
            onReset={() => onResetTextStyle(name)}
          />
        )
        return (
          <ActionList>
            {isTitle ? (
              <StyleRow
                {...TITLE_STYLE}
                isSelected
                onSelect={close}
                editControl={renderOptions(
                  TITLE_STYLE.name,
                  TITLE_STYLE.label,
                  null,
                )}
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
                  editControl={renderOptions(
                    textStyle.name,
                    textStyle.label,
                    textStyle,
                  )}
                />
              ))
            )}
          </ActionList>
        )
      }}
    </Popover>
  )
}
