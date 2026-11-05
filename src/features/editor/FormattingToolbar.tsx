import { useEditorState, type Editor } from '@tiptap/react'
import { Button } from '../../design-system'
import { FORMATTING_ACTIONS } from './formattingActions'
import styles from './FormattingToolbar.module.css'

export function FormattingToolbar({ editor }: { editor: Editor }) {
  const activeActionNames = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) =>
      FORMATTING_ACTIONS.filter(({ isActive }) => isActive(currentEditor))
        .map(({ name }) => name)
        .join(' '),
  }).split(' ')

  return (
    <div role="group" aria-label="Formatting" className={styles.toolbar}>
      {FORMATTING_ACTIONS.map(({ name, label, icon: Icon, run }) => (
        <Button
          key={name}
          iconOnly
          aria-label={label}
          title={label}
          aria-pressed={activeActionNames.includes(name)}
          onClick={() => run(editor)}
        >
          <Icon aria-hidden="true" />
        </Button>
      ))}
    </div>
  )
}
