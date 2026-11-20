import type { Editor } from '@tiptap/react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  type LucideIcon,
} from 'lucide-react'
import type { TextAlignment } from '../../journal-document'
import type { ShortcutCommandId } from '../../keyboard-shortcuts'
import { chooseOwnValue } from './ownOrStyleValue'

export type TextAlignmentOption = {
  value: TextAlignment
  label: string
  icon: LucideIcon
  shortcutId: ShortcutCommandId
}

/* Stored as start and end (they'd follow right-to-left writing); named as people know them. */
export const TEXT_ALIGNMENT_OPTIONS: readonly TextAlignmentOption[] = [
  { value: 'start', label: 'Left', icon: AlignLeft, shortcutId: 'align-left' },
  {
    value: 'center',
    label: 'Center',
    icon: AlignCenter,
    shortcutId: 'align-center',
  },
  { value: 'end', label: 'Right', icon: AlignRight, shortcutId: 'align-right' },
]

export function getTextAlignmentOption(
  alignment: TextAlignment,
): TextAlignmentOption {
  return (
    TEXT_ALIGNMENT_OPTIONS.find(({ value }) => value === alignment) ??
    TEXT_ALIGNMENT_OPTIONS[0]
  )
}

/**
 * Lines up the selected blocks (or the cursor's). Choosing what their text
 * style gives removes their own, so they follow the style again.
 */
export function chooseTextAlignment(
  editor: Editor,
  alignment: TextAlignment,
  styleAlignment: TextAlignment,
) {
  chooseOwnValue(alignment, styleAlignment, {
    set: (ownAlignment) => editor.chain().setTextAlignment(ownAlignment).run(),
    unset: () => editor.chain().unsetTextAlignment().run(),
  })
}
