import { formatShortcut, toAriaKeyShortcut } from './shortcuts'

describe('shortcuts', () => {
  it('shows Mac symbols in Apple order (⌃ ⌥ ⇧ ⌘)', () => {
    expect(formatShortcut('Mod-Shift-x', true)).toBe('⇧⌘X')
    expect(formatShortcut('Mod-Alt-2', true)).toBe('⌥⌘2')
  })

  it('spells modifiers out elsewhere, with Ctrl for Mod', () => {
    expect(formatShortcut('Mod-Alt-c', false)).toBe('Ctrl+Alt+C')
  })

  it('names keys for screen readers', () => {
    expect(toAriaKeyShortcut('Mod-b', true)).toBe('Meta+B')
    expect(toAriaKeyShortcut('Mod-Shift-8', false)).toBe('Control+Shift+8')
  })
})
