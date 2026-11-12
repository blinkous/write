import { useEditorState, type Editor } from '@tiptap/react'
import { ChevronDown } from 'lucide-react'
import { ActionList, MenuItem, Popover } from '../../design-system'
import { applyTextStyle, getActiveTextStyle, TEXT_STYLES } from './textStyles'
import styles from './TextStyleMenu.module.css'

/** Largest first, as menus list them; the order for stepping is TEXT_STYLES. */
const MENU_STYLES = TEXT_STYLES.toReversed()

/**
 * The current paragraph's style. The toolbar shows just its icon; the menu
 * repeats that icon beside each spelled-out name, shown at its size.
 */
export function TextStyleMenu({ editor }: { editor: Editor }) {
  const activeStyle = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => getActiveTextStyle(currentEditor),
  })
  const { icon: ActiveIcon, label: activeLabel } = activeStyle

  return (
    <Popover
      label={`Text style: ${activeLabel} (⌘⇧> / ⌘⇧< to change)`}
      isTriggerIconOnly={false}
      trigger={
        <>
          <ActiveIcon aria-hidden="true" />
          <ChevronDown aria-hidden="true" className={styles.chevron} />
        </>
      }
      // Back to the text, so writing continues in the new style.
      onClose={() => editor.commands.focus()}
    >
      {(close) => (
        <ActionList>
          {MENU_STYLES.map((textStyle) => {
            const { name, label, icon: Icon } = textStyle
            return (
              <MenuItem
                key={name}
                isSelected={name === activeStyle.name}
                onClick={() => {
                  applyTextStyle(editor, textStyle)
                  close()
                }}
              >
                <Icon aria-hidden="true" />
                <span className={styles[name]}>{label}</span>
              </MenuItem>
            )
          })}
        </ActionList>
      )}
    </Popover>
  )
}
