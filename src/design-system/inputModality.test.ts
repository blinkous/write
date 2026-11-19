import { fireEvent } from '@testing-library/react'
import { trackInputModality } from './inputModality'

describe('trackInputModality', () => {
  it('follows the last input: keys for keyboard, clicks and taps for pointer', () => {
    trackInputModality()
    const { dataset } = document.documentElement
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(dataset.input).toBe('keyboard')
    fireEvent.pointerDown(window)
    expect(dataset.input).toBe('pointer')
    // A modifier alone (e.g. ⌘ before a click) doesn't count as keyboard use.
    fireEvent.keyDown(window, { key: 'Meta' })
    expect(dataset.input).toBe('pointer')
  })
})
