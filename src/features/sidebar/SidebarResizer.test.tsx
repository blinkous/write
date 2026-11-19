import { fireEvent, render, screen } from '@testing-library/react'
import { SidebarResizer } from './SidebarResizer'
import { getChosenSidebarWidth, resetSidebarWidth } from './sidebarWidth'

// jsdom loads no stylesheets: give the page tokens.css's values.
beforeEach(() => {
  const { style } = document.documentElement
  style.setProperty('--width-sidebar', '16rem')
  style.setProperty('--share-sidebar-max', '0.4')
  window.innerWidth = 1280
})

afterEach(() => {
  resetSidebarWidth()
  onDone.mockClear()
})

const onDone = vi.fn()

function renderResizer() {
  render(<SidebarResizer sidebarId="sidebar" onDone={onDone} />)
  return screen.getByRole('separator', { name: 'Sidebar width' })
}

describe('SidebarResizer', () => {
  it('steps the width with the arrow keys, and saves it', () => {
    const resizer = renderResizer()
    expect(resizer).toHaveAttribute('aria-valuenow', '16')
    fireEvent.keyDown(resizer, { key: 'ArrowRight' })
    fireEvent.keyDown(resizer, { key: 'ArrowRight' })
    expect(resizer).toHaveAttribute('aria-valuenow', '18')
    expect(localStorage.getItem('write.sidebarWidth.v1')).toBe('18')
    expect(
      document.documentElement.style.getPropertyValue('--width-sidebar-chosen'),
    ).toBe('18rem')
  })

  it('goes to the narrowest and widest with Home and End', () => {
    const resizer = renderResizer()
    fireEvent.keyDown(resizer, { key: 'Home' })
    expect(resizer).toHaveAttribute('aria-valuenow', '14')
    fireEvent.keyDown(resizer, { key: 'End' })
    expect(resizer).toHaveAttribute('aria-valuenow', '28')
  })

  it('keeps the page room in a small window', () => {
    window.innerWidth = 800
    const resizer = renderResizer()
    fireEvent.keyDown(resizer, { key: 'End' })
    // 40% of 800px is 20rem.
    expect(resizer).toHaveAttribute('aria-valuenow', '20')
  })

  it('puts the default back on a double-click, keeping nothing stored', () => {
    const resizer = renderResizer()
    fireEvent.keyDown(resizer, { key: 'ArrowLeft' })
    fireEvent.doubleClick(resizer)
    expect(getChosenSidebarWidth()).toBeNull()
    expect(localStorage.getItem('write.sidebarWidth.v1')).toBeNull()
    expect(
      document.documentElement.style.getPropertyValue('--width-sidebar-chosen'),
    ).toBe('')
  })

  it('follows a drag, saving once it ends', () => {
    const resizer = renderResizer()
    fireEvent.pointerDown(resizer, { button: 0, clientX: 256 })
    fireEvent.pointerMove(resizer, { clientX: 320 })
    expect(resizer).toHaveAttribute('aria-valuenow', '20')
    expect(localStorage.getItem('write.sidebarWidth.v1')).toBeNull()
    fireEvent.pointerUp(resizer)
    expect(localStorage.getItem('write.sidebarWidth.v1')).toBe('20')
  })

  it('is done with Enter or Escape, moving focus on', () => {
    const resizer = renderResizer()
    fireEvent.keyDown(resizer, { key: 'Enter' })
    fireEvent.keyDown(resizer, { key: 'Escape' })
    expect(onDone).toHaveBeenCalledTimes(2)
  })
})
