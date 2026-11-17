import type { TextCase } from '../journal-document'

/** Each label is written in its own case so the menu doubles as a preview. */
export const TEXT_CASE_OPTIONS: readonly { value: TextCase; label: string }[] =
  [
    { value: 'upper', label: 'UPPERCASE' },
    { value: 'lower', label: 'lowercase' },
    { value: 'title', label: 'Title Case' },
    { value: 'sentence', label: 'Sentence case' },
  ]
