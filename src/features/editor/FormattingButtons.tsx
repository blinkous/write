import { useEditorState, type Editor } from '@tiptap/react'
import { Button } from '../../design-system'
import { formatShortcut, toAriaKeyShortcut } from '../../utils/shortcuts'
import { editorSupports, type FormattingAction } from './formattingActions'

type FormattingButtonsProps = {
  editor: Editor
  /** Which buttons, in order (e.g. TEXT_FORMATTING_ACTIONS); the toolbar groups them. */
  actions: readonly FormattingAction[]
}

/** A button per action (pressed while a toggle is on), off in editors that lack it (e.g. lists in the title). */
export function FormattingButtons({ editor, actions }: FormattingButtonsProps) {
  const activeActionNames = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) =>
      actions
        .filter(
          ({ requires, isActive }) =>
            editorSupports(currentEditor, requires) &&
            isActive?.(currentEditor) === true,
        )
        .map(({ name }) => name)
        .join(' '),
  }).split(' ')

  return actions.map(
    ({ name, label, shortcut, icon: Icon, requires, isActive, run }) => (
      <Button
        key={name}
        iconOnly
        aria-label={label}
        aria-keyshortcuts={toAriaKeyShortcut(shortcut)}
        title={`${label} (${formatShortcut(shortcut)})`}
        // Only toggles have a pressed state; a one-off action (reset) has none.
        aria-pressed={isActive ? activeActionNames.includes(name) : undefined}
        disabled={!editorSupports(editor, requires)}
        onClick={() => run(editor)}
      >
        <Icon aria-hidden="true" />
      </Button>
    ),
  )
}
