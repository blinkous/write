import { checkShortcut } from './shortcutRules'

describe('checkShortcut', () => {
  it('allows ⌘ or Ctrl shortcuts, and ⌥ with keys that don’t type', () => {
    expect(checkShortcut('Mod-k').isAllowed).toBe(true)
    expect(checkShortcut('Mod-Shift-c').isAllowed).toBe(true)
    expect(checkShortcut('Alt-ArrowUp').isAllowed).toBe(true)
  })

  it('refuses keys that would go off while typing', () => {
    expect(checkShortcut('k').isAllowed).toBe(false)
    expect(checkShortcut('Shift-k').isAllowed).toBe(false)
    expect(checkShortcut('Alt-c').isAllowed).toBe(false)
  })

  it('refuses keys the browser keeps or that edit text', () => {
    expect(checkShortcut('Mod-w')).toMatchObject({
      isAllowed: false,
      reason: expect.stringContaining('closes the tab'),
    })
    expect(checkShortcut('Mod-c').isAllowed).toBe(false)
    expect(checkShortcut('Alt-Tab').isAllowed).toBe(false)
  })
})
