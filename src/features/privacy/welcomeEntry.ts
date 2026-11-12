import type { JSONContent } from '@tiptap/react'
import { formatShortcut } from '../../utils/shortcuts'
import {
  PRIVACY_NOTES,
  WELCOME_INTRO,
  WELCOME_SIGN_OFF,
  WELCOME_TITLE,
} from './privacyNotes'

type Inline = string | { code: string }

function paragraph(...inlines: Inline[]): JSONContent {
  return {
    type: 'paragraph',
    content: inlines.map((inline) =>
      typeof inline === 'string'
        ? { type: 'text', text: inline }
        : { type: 'text', text: inline.code, marks: [{ type: 'code' }] },
    ),
  }
}

function heading(level: number, text: string): JSONContent {
  return {
    type: 'heading',
    attrs: { level },
    content: [{ type: 'text', text }],
  }
}

function bulletList(items: readonly Inline[][]): JSONContent {
  return {
    type: 'bulletList',
    content: items.map((inlines) => ({
      type: 'listItem',
      content: [paragraph(...inlines)],
    })),
  }
}

/*
 * DRAFT tour, written for the author to rewrite in their own voice. It shows
 * the page's features by using them (a title, headings, lists, code).
 */
function getTourItems(): Inline[][] {
  return [
    [
      'Click the title above to rename this entry. Leave it blank and the first line names it.',
    ],
    [
      `Pick a text style from the ¶ menu, or step through them with ${formatShortcut('Mod-Shift->')} and ${formatShortcut('Mod-Shift-<')}.`,
    ],
    [
      'Markdown works as you type: ',
      { code: '##' },
      ' for a heading, ',
      { code: '-' },
      ' for a list, ',
      { code: '>' },
      ' for a quote.',
    ],
    [
      'Select any text to give it its own font, color or case from the toolbar.',
    ],
    [
      'Settings (⚙ at the bottom of the sidebar) has fonts, colors and backups.',
    ],
    [
      `${formatShortcut('Mod-s')} saves this entry as a backup; ${formatShortcut('Mod-Shift-s')} saves them all.`,
    ],
    [
      'Delete this entry from the ⋯ menu at the top right whenever you’re ready.',
    ],
  ]
}

/** The first entry on a first visit: the welcome note and a quick tour, as a real, editable entry. */
export function getWelcomeEntry(): { title: string; content: JSONContent } {
  return {
    title: WELCOME_TITLE,
    content: {
      type: 'doc',
      content: [
        paragraph(WELCOME_INTRO),
        // DRAFT heading
        heading(2, 'Your privacy'),
        bulletList(PRIVACY_NOTES.map(({ lines }) => [lines.join(' ')])),
        // DRAFT heading
        heading(2, 'A quick tour'),
        bulletList(getTourItems()),
        paragraph(WELCOME_SIGN_OFF),
      ],
    },
  }
}
