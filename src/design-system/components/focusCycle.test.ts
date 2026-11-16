import { nextInFocusCycle } from './focusCycle'

const CONTROLS = ['journal', 'settings', 'cancel', 'export']

describe('nextInFocusCycle', () => {
  it.each([
    ['the container', 'dialog', false, 'journal'],
    ['the container', 'dialog', true, 'export'],
    ['a middle control', 'settings', false, 'cancel'],
    ['a middle control', 'settings', true, 'journal'],
    ['the last control', 'export', false, 'journal'],
    ['the first control', 'journal', true, 'export'],
  ])(
    'from %s (%s, backwards: %s) goes to %s',
    (_, current, isBackwards, expected) => {
      expect(nextInFocusCycle(CONTROLS, current, isBackwards)).toBe(expected)
    },
  )

  it('stays on a lone control', () => {
    expect(nextInFocusCycle(['ok'], 'ok', false)).toBe('ok')
  })

  it('has nowhere to go without controls', () => {
    expect(nextInFocusCycle([], 'dialog', false)).toBeUndefined()
  })
})
