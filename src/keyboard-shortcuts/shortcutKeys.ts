import { base, keyName } from 'w3c-keyname'
import { isApplePlatform } from '../utils/shortcuts'

/*
 * Shortcuts are kept in Tiptap / ProseMirror form ("Mod-Shift-x"), written one
 * way so two spellings of the same keys compare equal: modifiers in a fixed
 * order, then the key, lowercase if it's a single character. Mod is ⌘ on
 * Apple devices and Ctrl elsewhere, so one stored shortcut suits both.
 */

const MODIFIER_ORDER = ['Mod', 'Ctrl', 'Meta', 'Alt', 'Shift'] as const
type Modifier = (typeof MODIFIER_ORDER)[number]

/** Keys pressed alone while recording: they only start a combination. */
const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'OS'])

function toModifier(name: string, isApple: boolean): Modifier | null {
  switch (name) {
    case 'Mod':
    case 'Alt':
    case 'Shift':
      return name
    case 'Cmd':
    case 'Meta':
      return isApple ? 'Mod' : 'Meta'
    case 'Ctrl':
    case 'Control':
      return isApple ? 'Ctrl' : 'Mod'
    default:
      return null
  }
}

function toKeyName(key: string): string {
  if (key === ' ') return 'Space'
  return key.length === 1 ? key.toLowerCase() : key
}

function joinShortcut(modifiers: Iterable<Modifier>, key: string): string {
  const pressed = new Set(modifiers)
  return [
    ...MODIFIER_ORDER.filter((modifier) => pressed.has(modifier)),
    toKeyName(key),
  ].join('-')
}

/** "Shift-Mod-B" → "Mod-Shift-b". The last part is the key, so "Mod--" is ⌘ and minus. */
export function normalizeShortcut(
  shortcut: string,
  isApple = isApplePlatform(),
): string {
  const parts = shortcut.split(/-(?!$)/)
  const key = parts.pop() ?? ''
  const modifiers = parts.flatMap((part) => toModifier(part, isApple) ?? [])
  return joinShortcut(modifiers, key)
}

function getEventModifiers(
  { metaKey, ctrlKey, altKey, shiftKey }: KeyboardEvent,
  isApple: boolean,
): Modifier[] {
  const pressed: [boolean, Modifier][] = [
    [isApple ? metaKey : ctrlKey, 'Mod'],
    [isApple && ctrlKey, 'Ctrl'],
    [!isApple && metaKey, 'Meta'],
    [altKey, 'Alt'],
    [shiftKey, 'Shift'],
  ]
  return pressed.flatMap(([isDown, modifier]) => (isDown ? [modifier] : []))
}

/**
 * The key by its place on a US keyboard ("8" for ⇧8, "c" for ⌥C on a Mac,
 * which types "ç"), as ProseMirror falls back to; else the key typed.
 */
function getBaseKey(event: KeyboardEvent): string {
  return base[event.keyCode] ?? keyName(event)
}

/** The shortcut a key press records as, or null while only modifiers are down. */
export function shortcutFromEvent(
  event: KeyboardEvent,
  isApple = isApplePlatform(),
): string | null {
  if (MODIFIER_KEYS.has(event.key)) return null
  return joinShortcut(getEventModifiers(event, isApple), getBaseKey(event))
}

/**
 * Every way a key press can be written: by the key typed and by its place on
 * the keyboard, so shortcuts work on other layouts as they do in ProseMirror.
 */
export function shortcutsForEvent(
  event: KeyboardEvent,
  isApple = isApplePlatform(),
): string[] {
  const modifiers = getEventModifiers(event, isApple)
  return [
    ...new Set([
      joinShortcut(modifiers, keyName(event)),
      joinShortcut(modifiers, getBaseKey(event)),
    ]),
  ]
}
