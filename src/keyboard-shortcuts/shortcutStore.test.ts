import {
  assignShortcut,
  getShortcut,
  isShortcutChanged,
  resetAllShortcuts,
  resetShortcut,
} from './shortcutStore'

afterEach(resetAllShortcuts)

describe('shortcutStore', () => {
  it('gives actions their defaults until changed', () => {
    expect(getShortcut('bold')).toBe('Mod-b')
    expect(isShortcutChanged('bold')).toBe(false)
  })

  it('moves a shortcut from the action that had it, and says which', () => {
    expect(assignShortcut('underline', 'Mod-b')).toBe('bold')
    expect(getShortcut('underline')).toBe('Mod-b')
    expect(getShortcut('bold')).toBeNull()
  })

  it('takes a default back on reset', () => {
    assignShortcut('underline', 'Mod-b')
    expect(resetShortcut('bold')).toBe('underline')
    expect(getShortcut('bold')).toBe('Mod-b')
    expect(getShortcut('underline')).toBeNull()
  })

  it('keeps only changes, and saves them', () => {
    assignShortcut('italic', 'Mod-k')
    assignShortcut('italic', 'Mod-i')
    expect(isShortcutChanged('italic')).toBe(false)
    assignShortcut('code', null)
    expect(
      JSON.parse(localStorage.getItem('write.shortcuts.v1') ?? ''),
    ).toEqual({ code: null })
  })
})
