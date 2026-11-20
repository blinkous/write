import { fireEvent, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { useScrollFades } from './useScrollFades'

function ScrollingList() {
  const ref = useRef<HTMLUListElement>(null)
  const fadeClassName = useScrollFades(ref, 'vertical')
  return (
    <ul ref={ref} className={fadeClassName} data-testid="list">
      <li>Rainy Sunday</li>
    </ul>
  )
}

// jsdom has no layout: give the list sizes (its ResizeObserver never fires, see setup).
function renderList(sizes: { clientHeight: number; scrollHeight: number }) {
  for (const [name, value] of Object.entries(sizes))
    Object.defineProperty(HTMLElement.prototype, name, {
      configurable: true,
      get: () => value,
    })
  render(<ScrollingList />)
  return screen.getByTestId('list')
}

afterEach(() => {
  for (const name of ['clientHeight', 'scrollHeight'])
    Reflect.deleteProperty(HTMLElement.prototype, name)
})

describe('useScrollFades, up and down', () => {
  it('fades neither edge while everything fits', () => {
    const list = renderList({ clientHeight: 300, scrollHeight: 300 })
    expect(list).not.toHaveAttribute('data-more-start')
    expect(list).not.toHaveAttribute('data-more-end')
  })

  it('fades the top and bottom that have more, following the scroll', () => {
    const list = renderList({ clientHeight: 200, scrollHeight: 500 })
    expect(list).not.toHaveAttribute('data-more-start')
    expect(list).toHaveAttribute('data-more-end')
    list.scrollTop = 300
    fireEvent.scroll(list)
    expect(list).toHaveAttribute('data-more-start')
    expect(list).not.toHaveAttribute('data-more-end')
  })
})
