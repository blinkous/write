import { TEXT_STYLE_LABELS } from '../text-styles'

/**
 * Where a shortcut works: `editor` ones while typing in the writing or the
 * title; `page` ones anywhere on the page.
 */
type ShortcutScope = 'editor' | 'page'

type ShortcutCommandDefinition = {
  id: string
  label: string
  /** Heading it's listed under in settings. */
  group: string
  /** In Tiptap form, e.g. "Mod-Shift-x" (see utils/shortcuts); null for none until someone sets one. */
  defaultShortcut: string | null
  scope: ShortcutScope
}

/**
 * Every action with a keyboard shortcut, in the order settings list them.
 * Keys every app shares (undo, copy, paste, Tab, Enter, Escape) aren't here:
 * they stay as they are.
 */
export const SHORTCUT_COMMANDS = [
  {
    id: 'bold',
    label: 'Bold',
    group: 'Text',
    defaultShortcut: 'Mod-b',
    scope: 'editor',
  },
  {
    id: 'italic',
    label: 'Italic',
    group: 'Text',
    defaultShortcut: 'Mod-i',
    scope: 'editor',
  },
  {
    id: 'underline',
    label: 'Underline',
    group: 'Text',
    defaultShortcut: 'Mod-u',
    scope: 'editor',
  },
  {
    // ⇧⌘X as in Google Docs; Tiptap's ⇧⌘S is Export.
    id: 'strike',
    label: 'Strikethrough',
    group: 'Text',
    defaultShortcut: 'Mod-Shift-x',
    scope: 'editor',
  },
  {
    id: 'align-left',
    label: 'Align left',
    group: 'Text',
    defaultShortcut: 'Mod-Shift-l',
    scope: 'editor',
  },
  {
    id: 'align-center',
    label: 'Align center',
    group: 'Text',
    defaultShortcut: 'Mod-Shift-e',
    scope: 'editor',
  },
  {
    // ⇧⌘R, what other editors use, reloads the page and can't be taken.
    id: 'align-right',
    label: 'Align right',
    group: 'Text',
    defaultShortcut: null,
    scope: 'editor',
  },
  {
    id: 'bullet-list',
    label: 'Bulleted list',
    group: 'Markup',
    defaultShortcut: 'Mod-Shift-8',
    scope: 'editor',
  },
  {
    id: 'ordered-list',
    label: 'Numbered list',
    group: 'Markup',
    defaultShortcut: 'Mod-Shift-7',
    scope: 'editor',
  },
  {
    id: 'blockquote',
    label: 'Quote',
    group: 'Markup',
    defaultShortcut: 'Mod-Shift-b',
    scope: 'editor',
  },
  {
    id: 'code',
    label: 'Code',
    group: 'Markup',
    defaultShortcut: 'Mod-e',
    scope: 'editor',
  },
  {
    id: 'code-block',
    label: 'Code block',
    group: 'Markup',
    defaultShortcut: 'Mod-Alt-c',
    scope: 'editor',
  },
  {
    id: 'insert-image',
    label: 'Insert picture',
    group: 'Markup',
    defaultShortcut: null,
    scope: 'editor',
  },
  {
    id: 'text-style-body',
    label: TEXT_STYLE_LABELS['body'],
    group: 'Text styles',
    defaultShortcut: 'Mod-Alt-0',
    scope: 'editor',
  },
  {
    id: 'text-style-heading-2',
    label: TEXT_STYLE_LABELS['heading-2'],
    group: 'Text styles',
    defaultShortcut: 'Mod-Alt-2',
    scope: 'editor',
  },
  {
    id: 'text-style-heading-3',
    label: TEXT_STYLE_LABELS['heading-3'],
    group: 'Text styles',
    defaultShortcut: 'Mod-Alt-3',
    scope: 'editor',
  },
  {
    id: 'text-style-heading-4',
    label: TEXT_STYLE_LABELS['heading-4'],
    group: 'Text styles',
    defaultShortcut: 'Mod-Alt-4',
    scope: 'editor',
  },
  {
    id: 'text-style-heading-5',
    label: TEXT_STYLE_LABELS['heading-5'],
    group: 'Text styles',
    defaultShortcut: 'Mod-Alt-5',
    scope: 'editor',
  },
  {
    id: 'text-style-heading-6',
    label: TEXT_STYLE_LABELS['heading-6'],
    group: 'Text styles',
    defaultShortcut: 'Mod-Alt-6',
    scope: 'editor',
  },
  {
    // ⇧⌘> / ⇧⌘<, like resizing in Word or Docs.
    id: 'larger-text-style',
    label: 'Larger style',
    group: 'Text styles',
    defaultShortcut: 'Mod-Shift-.',
    scope: 'editor',
  },
  {
    id: 'smaller-text-style',
    label: 'Smaller style',
    group: 'Text styles',
    defaultShortcut: 'Mod-Shift-,',
    scope: 'editor',
  },
  {
    // Like VS Code's Alt+Up/Down.
    id: 'move-block-up',
    label: 'Move block up',
    group: 'Blocks',
    defaultShortcut: 'Alt-ArrowUp',
    scope: 'editor',
  },
  {
    id: 'move-block-down',
    label: 'Move block down',
    group: 'Blocks',
    defaultShortcut: 'Alt-ArrowDown',
    scope: 'editor',
  },
  {
    // ⇧⌘C is the element inspector in Chrome and Edge, which pages can't take.
    id: 'copy-selection-markdown',
    label: 'Copy selection as markdown',
    group: 'Entry',
    defaultShortcut: 'Mod-Alt-Shift-c',
    scope: 'page',
  },
  {
    id: 'copy-entry-markdown',
    label: 'Copy entry as markdown',
    group: 'Entry',
    defaultShortcut: null,
    scope: 'page',
  },
  {
    // ⌘S and ⌘O replace the browser's "save page" and "open file", which are no use here.
    id: 'export-entry',
    label: 'Export entry as JSON',
    group: 'Entry',
    defaultShortcut: 'Mod-s',
    scope: 'page',
  },
  {
    id: 'open-export',
    label: 'Export',
    group: 'Entry',
    defaultShortcut: 'Mod-Shift-s',
    scope: 'page',
  },
  {
    id: 'open-import',
    label: 'Import from JSON',
    group: 'Entry',
    defaultShortcut: 'Mod-o',
    scope: 'page',
  },
] as const satisfies readonly ShortcutCommandDefinition[]

export type ShortcutCommand = (typeof SHORTCUT_COMMANDS)[number]
export type ShortcutCommandId = ShortcutCommand['id']
type PageShortcutCommand = Extract<ShortcutCommand, { scope: 'page' }>
export type PageShortcutCommandId = PageShortcutCommand['id']

export const PAGE_SHORTCUT_COMMAND_IDS = SHORTCUT_COMMANDS.filter(
  (command): command is PageShortcutCommand => command.scope === 'page',
).map(({ id }) => id)

export function isShortcutCommandId(value: string): value is ShortcutCommandId {
  return SHORTCUT_COMMANDS.some(({ id }) => id === value)
}

export function getShortcutCommand(id: ShortcutCommandId): ShortcutCommand {
  const command = SHORTCUT_COMMANDS.find((candidate) => candidate.id === id)
  if (!command) throw new Error(`Unknown shortcut command: ${id}`)
  return command
}
