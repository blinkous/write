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
      expect(nextInFocusCycle(CONTROLS, current, { isBackwards })).toBe(
        expected,
      )
    },
  )

  it('stays on a lone control', () => {
    expect(nextInFocusCycle(['ok'], 'ok', { isBackwards: false })).toBe('ok')
  })

  it('has nowhere to go without controls', () => {
    expect(
      nextInFocusCycle([], 'dialog', { isBackwards: false }),
    ).toBeUndefined()
  })

  describe('with a first stop', () => {
    const firstStop = 'export'

    it('lands there on the first Tab, then carries on in order', () => {
      expect(
        nextInFocusCycle(CONTROLS, 'dialog', { isBackwards: false, firstStop }),
      ).toBe('export')
      expect(
        nextInFocusCycle(CONTROLS, 'export', { isBackwards: false, firstStop }),
      ).toBe('journal')
    })

    it('leaves Shift+Tab from the container going to the last control', () => {
      expect(
        nextInFocusCycle(['export', 'cancel'], 'dialog', {
          isBackwards: true,
          firstStop,
        }),
      ).toBe('cancel')
    })

    it('starts at the first control when the stop is unreachable, e.g. disabled', () => {
      expect(
        nextInFocusCycle(['journal', 'cancel'], 'dialog', {
          isBackwards: false,
          firstStop,
        }),
      ).toBe('journal')
    })
  })
})
