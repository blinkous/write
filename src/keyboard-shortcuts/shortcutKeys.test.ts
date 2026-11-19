import {
  normalizeShortcut,
  shortcutFromEvent,
  shortcutsForEvent,
} from './shortcutKeys'

describe('normalizeShortcut', () => {
  it('writes the same keys one way', () => {
    expect(normalizeShortcut('Shift-Mod-B', true)).toBe('Mod-Shift-b')
    expect(normalizeShortcut('Alt-Mod-c', false)).toBe('Mod-Alt-c')
    expect(normalizeShortcut('Mod--', true)).toBe('Mod--')
  })

  it('reads Ctrl as Mod off Apple devices, and as itself on them', () => {
    expect(normalizeShortcut('Ctrl-k', false)).toBe('Mod-k')
    expect(normalizeShortcut('Ctrl-k', true)).toBe('Ctrl-k')
  })
})

describe('shortcutFromEvent', () => {
  it('records the key by its place, so ⇧8 is 8 and ⌥C on a Mac is c', () => {
    const shiftEight = new KeyboardEvent('keydown', {
      key: '*',
      keyCode: 56,
      metaKey: true,
      shiftKey: true,
    })
    expect(shortcutFromEvent(shiftEight, true)).toBe('Mod-Shift-8')
    const altC = new KeyboardEvent('keydown', {
      key: 'ç',
      keyCode: 67,
      metaKey: true,
      altKey: true,
    })
    expect(shortcutFromEvent(altC, true)).toBe('Mod-Alt-c')
  })

  it('waits while only modifiers are down', () => {
    const shift = new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true })
    expect(shortcutFromEvent(shift, true)).toBeNull()
  })
})

describe('shortcutsForEvent', () => {
  it('matches by the key typed and by its place', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'и',
      keyCode: 66,
      ctrlKey: true,
    })
    expect(shortcutsForEvent(event, false)).toEqual(['Mod-и', 'Mod-b'])
  })
})
