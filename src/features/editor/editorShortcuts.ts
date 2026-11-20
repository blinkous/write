import { Extension, type Editor } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import {
  findShortcutCommand,
  type ShortcutCommandId,
} from '../../keyboard-shortcuts'
import {
  editorSupports,
  MARKUP_FORMATTING_ACTIONS,
  TEXT_FORMATTING_ACTIONS,
  type FormattingAction,
} from './formattingActions'
import { DEFAULT_TEXT_STYLES, type TextStyles } from '../../text-styles'
import {
  chooseTextAlignment,
  TEXT_ALIGNMENT_OPTIONS,
} from './textAlignmentOptions'
import {
  applyTextStyle,
  getTextStyleNameAt,
  stepTextStyle,
  TEXT_STYLES,
} from './textStyles'

/** An editor action run by its shortcut; false if it didn't apply, so the key goes on. */
export type EditorShortcutCommand = {
  id: ShortcutCommandId
  run: (editor: Editor) => boolean
}

function fromFormattingAction({
  shortcutId,
  requires,
  run,
}: FormattingAction): EditorShortcutCommand {
  return {
    id: shortcutId,
    run: (editor) => {
      if (!editorSupports(editor, requires)) return false
      run(editor)
      return true
    },
  }
}

/** Alignment follows the menu's rule: the style's alignment removes the text's own. */
function alignmentCommands(isTitle: boolean): EditorShortcutCommand[] {
  return TEXT_ALIGNMENT_OPTIONS.map(({ value, shortcutId }) => ({
    id: shortcutId,
    run: (editor) => {
      const { textStyles } = editor.storage.editorShortcuts
      const styleName = getTextStyleNameAt(editor, isTitle)
      chooseTextAlignment(editor, value, textStyles[styleName].alignment)
      return true
    },
  }))
}

/** The title's: emphasis and alignment (it has no blocks or styles to change). */
export const TITLE_SHORTCUT_COMMANDS: readonly EditorShortcutCommand[] = [
  ...TEXT_FORMATTING_ACTIONS.map(fromFormattingAction),
  ...alignmentCommands(true),
]

/** The writing's: every editor action. */
export const WRITING_SHORTCUT_COMMANDS: readonly EditorShortcutCommand[] = [
  ...TEXT_FORMATTING_ACTIONS.map(fromFormattingAction),
  ...alignmentCommands(false),
  ...MARKUP_FORMATTING_ACTIONS.map(fromFormattingAction),
  ...TEXT_STYLES.flatMap((textStyle) =>
    textStyle.shortcutId
      ? [
          {
            id: textStyle.shortcutId,
            run: (editor: Editor) => applyTextStyle(editor, textStyle),
          },
        ]
      : [],
  ),
  { id: 'larger-text-style', run: (editor) => stepTextStyle(editor, 1) },
  { id: 'smaller-text-style', run: (editor) => stepTextStyle(editor, -1) },
  { id: 'move-block-up', run: (editor) => editor.commands.moveBlocks('up') },
  {
    id: 'move-block-down',
    run: (editor) => editor.commands.moveBlocks('down'),
  },
]

type EditorShortcutsOptions = { commands: readonly EditorShortcutCommand[] }

type EditorShortcutsStorage = {
  /** The text styles as they are now, for shortcuts that follow them (see useTextStyleBlocks). */
  textStyles: TextStyles
}

declare module '@tiptap/core' {
  interface Storage {
    editorShortcuts: EditorShortcutsStorage
  }
}

/** Tells an editor's shortcuts the text styles as they are now (editors without them are left alone). */
export function shareTextStylesWithShortcuts(
  editor: Editor,
  textStyles: TextStyles,
): void {
  const { editorShortcuts } = editor.storage
  if (editorShortcuts) editorShortcuts.textStyles = textStyles
}

/**
 * Runs the editor's actions on their shortcuts, as set in settings. Ahead of
 * other extensions' keys, so a shortcut someone chose wins over Tiptap's.
 */
export const EditorShortcuts = Extension.create<
  EditorShortcutsOptions,
  EditorShortcutsStorage
>({
  name: 'editorShortcuts',
  priority: 1000,

  addOptions() {
    return { commands: [] }
  },

  addStorage: () => ({ textStyles: DEFAULT_TEXT_STYLES }),

  addProseMirrorPlugins() {
    const { editor, options } = this
    const commandIds = options.commands.map(({ id }) => id)
    return [
      new Plugin({
        key: new PluginKey('editorShortcuts'),
        props: {
          handleKeyDown(_view, event) {
            const commandId = findShortcutCommand(event, commandIds)
            const command = options.commands.find(({ id }) => id === commandId)
            return command ? command.run(editor) : false
          },
        },
      }),
    ]
  },
})
