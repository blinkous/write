import { useEditorState, type Editor } from '@tiptap/react'
import { Button } from '../../design-system'
import { formatShortcut, toAriaKeyShortcut } from '../../utils/shortcuts'
import { editorSupports, FORMATTING_ACTIONS } from './formattingActions'
import styles from './FormattingToolbar.module.css'

export function FormattingToolbar({ editor }: { editor: Editor }) {
  const activeActionNames = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) =>
      FORMATTING_ACTIONS.filter(
        ({ requires, isActive }) =>
          editorSupports(currentEditor, requires) && isActive(currentEditor),
      )
        .map(({ name }) => name)
        .join(' '),
  }).split(' ')

  return (
    <div role="group" aria-label="Formatting" className={styles.toolbar}>
      {FORMATTING_ACTIONS.map(
        ({ name, label, shortcut, icon: Icon, requires, run }) => (
          <Button
            key={name}
            iconOnly
            aria-label={label}
            aria-keyshortcuts={toAriaKeyShortcut(shortcut)}
            title={`${label} (${formatShortcut(shortcut)})`}
            aria-pressed={activeActionNames.includes(name)}
            disabled={!editorSupports(editor, requires)}
            onClick={() => run(editor)}
          >
            <Icon aria-hidden="true" />
          </Button>
        ),
      )}
    </div>
  )
}
