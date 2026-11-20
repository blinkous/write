import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button flash', () => {
  it('doesn’t flash until asked, then alternates so each flash starts over', () => {
    const { rerender } = render(<Button>Undo</Button>)
    const button = screen.getByRole('button', { name: 'Undo' })
    expect(button).not.toHaveAttribute('data-flash')
    rerender(<Button flashCount={1}>Undo</Button>)
    expect(button).toHaveAttribute('data-flash', 'odd')
    rerender(<Button flashCount={2}>Undo</Button>)
    expect(button).toHaveAttribute('data-flash', 'even')
  })
})
