import { getUndoKey } from './undoKeys'

const press = (key: string, modifiers: Partial<KeyboardEventInit> = {}) =>
  new KeyboardEvent('keydown', { key, ...modifiers })

describe('getUndoKey', () => {
  it('reads ⌘Z and ⇧⌘Z on Apple devices', () => {
    expect(getUndoKey(press('z', { metaKey: true }), true)).toBe('undo')
    expect(
      getUndoKey(press('Z', { metaKey: true, shiftKey: true }), true),
    ).toBe('redo')
  })

  it('reads Ctrl+Z, Ctrl+Shift+Z and Ctrl+Y elsewhere', () => {
    expect(getUndoKey(press('z', { ctrlKey: true }), false)).toBe('undo')
    expect(
      getUndoKey(press('Z', { ctrlKey: true, shiftKey: true }), false),
    ).toBe('redo')
    expect(getUndoKey(press('y', { ctrlKey: true }), false)).toBe('redo')
  })

  it('ignores other keys and the other platform’s modifier', () => {
    expect(getUndoKey(press('z'), true)).toBeNull()
    expect(getUndoKey(press('z', { ctrlKey: true }), true)).toBeNull()
    expect(getUndoKey(press('y', { metaKey: true }), true)).toBeNull()
    expect(getUndoKey(press('z', { metaKey: true }), false)).toBeNull()
    expect(
      getUndoKey(press('z', { metaKey: true, altKey: true }), true),
    ).toBeNull()
  })
})
