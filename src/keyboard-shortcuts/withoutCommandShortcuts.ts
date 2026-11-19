import type { AnyExtension } from '@tiptap/core'
import { SHORTCUT_COMMANDS } from './shortcutCommands'
import { normalizeShortcut } from './shortcutKeys'

const DEFAULT_SHORTCUTS = new Set(
  SHORTCUT_COMMANDS.flatMap(({ defaultShortcut }) =>
    defaultShortcut ? [normalizeShortcut(defaultShortcut)] : [],
  ),
)

/**
 * The extensions (and those they bundle, like StarterKit's) without their own
 * keyboard shortcuts for keys an action here has by default. The app's
 * keymap gives those keys out instead, so a key someone moved elsewhere
 * doesn't keep working through Tiptap (⌘B still bolding after Bold moved).
 */
export function withoutCommandShortcuts(
  extensions: readonly AnyExtension[],
): AnyExtension[] {
  return extensions.map((extension) =>
    extension.extend({
      addKeyboardShortcuts() {
        const shortcuts = this.parent?.() ?? {}
        return Object.fromEntries(
          Object.entries(shortcuts).filter(
            ([shortcut]) => !DEFAULT_SHORTCUTS.has(normalizeShortcut(shortcut)),
          ),
        )
      },
      addExtensions() {
        return withoutCommandShortcuts(this.parent?.() ?? [])
      },
    }),
  )
}
