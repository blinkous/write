import { useEditorState, type Editor } from '@tiptap/react'
import { Baseline } from 'lucide-react'
import { Button, ColorInput, Field, Popover } from '../../design-system'
import { isHexColor } from '../../utils/color'
import styles from './TextColorPicker.module.css'

type TextColorPickerProps = {
  editor: Editor
  pageTextColor: string
}

/**
 * Colors the selected text, or the text about to be typed. "Use page color"
 * removes the override so the text follows the page text color again.
 */
export function TextColorPicker({
  editor,
  pageTextColor,
}: TextColorPickerProps) {
  const textColor = useEditorState({
    editor,
    selector: ({ editor: currentEditor }): string | null => {
      const { color } = currentEditor.getAttributes('textStyle')
      return typeof color === 'string' && isHexColor(color) ? color : null
    },
  })

  return (
    <Popover
      label={`Text color: ${textColor ?? 'page color'}`}
      trigger={
        <Baseline
          aria-hidden="true"
          style={{ color: textColor ?? undefined }}
        />
      }
      // Return to the text with its selection, so typing continues in the chosen color.
      onClose={() => editor.commands.focus()}
    >
      {(close) => (
        <div className={styles.panel}>
          <Field label="Text color">
            <ColorInput
              value={textColor ?? pageTextColor}
              onChange={({ target }) =>
                editor.chain().setColor(target.value).run()
              }
            />
          </Field>
          <Button
            variant="subtle"
            aria-pressed={textColor === null}
            onClick={() => {
              editor.chain().unsetColor().run()
              close()
            }}
          >
            Use page color
          </Button>
        </div>
      )}
    </Popover>
  )
}
