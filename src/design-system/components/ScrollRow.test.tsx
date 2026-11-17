import { fireEvent, render, screen } from '@testing-library/react'
import { ScrollRow } from './ScrollRow'

// jsdom has no layout: give the row sizes, and a ResizeObserver that never fires.
function renderRow(sizes: { clientWidth: number; scrollWidth: number }) {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  )
  for (const [name, value] of Object.entries(sizes))
    Object.defineProperty(HTMLElement.prototype, name, {
      configurable: true,
      get: () => value,
    })
  render(
    <ScrollRow data-testid="row">
      <button type="button">Bold</button>
    </ScrollRow>,
  )
  return screen.getByTestId('row')
}

afterEach(() => {
  vi.unstubAllGlobals()
  for (const name of ['clientWidth', 'scrollWidth'])
    Reflect.deleteProperty(HTMLElement.prototype, name)
})

describe('ScrollRow', () => {
  it('fades no end while everything fits', () => {
    const row = renderRow({ clientWidth: 300, scrollWidth: 300 })
    expect(row).not.toHaveAttribute('data-more-start')
    expect(row).not.toHaveAttribute('data-more-end')
  })

  it('fades each end that has more, following the scroll', () => {
    const row = renderRow({ clientWidth: 200, scrollWidth: 500 })
    expect(row).not.toHaveAttribute('data-more-start')
    expect(row).toHaveAttribute('data-more-end')
    row.scrollLeft = 300
    fireEvent.scroll(row)
    expect(row).toHaveAttribute('data-more-start')
    expect(row).not.toHaveAttribute('data-more-end')
  })
})
