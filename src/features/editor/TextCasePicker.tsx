import { useEditorState, type Editor } from '@tiptap/react'
import { CaseSensitive } from 'lucide-react'
import { ActionList, MenuItem, Popover } from '../../design-system'
import { TEXT_CASE_OPTIONS } from './textCaseOptions'

/**
 * Displays the selection (or the text about to be typed) in a case. Only the
 * display changes; the letters typed are kept, so "As typed" restores them.
 */
export function TextCasePicker({ editor }: { editor: Editor }) {
  const activeTextCase = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      const { textCase } = currentEditor.getAttributes('textCase')
      return TEXT_CASE_OPTIONS.find(({ value }) => value === textCase) ?? null
    },
  })

  return (
    <Popover
      label={`Text case: ${activeTextCase?.label ?? 'as typed'}`}
      trigger={<CaseSensitive aria-hidden="true" />}
      // Return to the text with its selection, so typing continues in the chosen case.
      onClose={() => editor.commands.focus()}
    >
      {(close) => (
        <ActionList>
          {TEXT_CASE_OPTIONS.map(({ value, label }) => (
            <MenuItem
              key={value}
              isSelected={activeTextCase?.value === value}
              onClick={() => {
                editor.chain().setTextCase(value).run()
                close()
              }}
            >
              {label}
            </MenuItem>
          ))}
          <MenuItem
            isSelected={activeTextCase === null}
            onClick={() => {
              editor.chain().unsetTextCase().run()
              close()
            }}
          >
            As typed
          </MenuItem>
        </ActionList>
      )}
    </Popover>
  )
}
