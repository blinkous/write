import { useEditorState, type Editor } from '@tiptap/react'
import { LetterSpacing } from 'lucide-react'
import {
  Button,
  LabeledRow,
  NumberStepper,
  Popover,
  PopoverPanel,
} from '../../design-system'
import {
  LETTER_SPACING_RANGE,
  resolveTextLetterSpacing,
} from '../../journal-document'
import type { TextStyles } from '../../text-styles'
import { getTextStyleNameAt } from './textStyles'

type TextLetterSpacingPickerProps = {
  editor: Editor
  /** Whether `editor` is the entry's title, whose text style is Title. */
  isTitle: boolean
  /** How each text style looks, for the spacing text without its own follows. */
  textStyles: TextStyles
}

/**
 * Gives the selected text, or the text about to be typed, its own letter
 * spacing (% of its size, the same stepper as each text style's in
 * settings). It shows the text's own spacing, or its style's; Match style
 * removes the text's own.
 */
export function TextLetterSpacingPicker({
  editor,
  isTitle,
  textStyles,
}: TextLetterSpacingPickerProps) {
  const { ownLetterSpacing, styleLetterSpacing } = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      const { letterSpacing } = currentEditor.getAttributes('textStyle')
      return {
        ownLetterSpacing:
          resolveTextLetterSpacing(letterSpacing) === null
            ? null
            : Number(letterSpacing),
        styleLetterSpacing:
          textStyles[getTextStyleNameAt(currentEditor, isTitle)].letterSpacing,
      }
    },
  })
  const shownLetterSpacing = ownLetterSpacing ?? styleLetterSpacing

  return (
    <Popover
      label={`Letter spacing: ${shownLetterSpacing}%`}
      trigger={<LetterSpacing aria-hidden="true" />}
      // Return to the text with its selection, so typing continues with the chosen spacing.
      onClose={() => editor.commands.focus()}
    >
      {(_close, refocus) => (
        <PopoverPanel width="regular">
          <LabeledRow label="Letter spacing" control="icon">
            <NumberStepper
              label="Letter spacing"
              value={shownLetterSpacing}
              min={LETTER_SPACING_RANGE.min}
              max={LETTER_SPACING_RANGE.max}
              unit="%"
              onChange={(letterSpacing) =>
                editor.chain().setTextLetterSpacing(letterSpacing).run()
              }
            />
          </LabeledRow>
          <Button
            variant="ghost"
            disabled={ownLetterSpacing === null}
            onClick={() => {
              // It turns off once used, so focus moves on rather than being lost.
              refocus()
              editor.chain().unsetTextLetterSpacing().run()
            }}
          >
            Match style
          </Button>
        </PopoverPanel>
      )}
    </Popover>
  )
}
