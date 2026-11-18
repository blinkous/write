import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { THEME_PACKS } from './themePacks'
import { ThemePackPicker } from './ThemePackPicker'

describe('ThemePackPicker', () => {
  const [current, other] = THEME_PACKS

  it('names each pack only in its tooltip and accessible name, and shows the current one as chosen', () => {
    render(<ThemePackPicker current={current.look} onSelect={() => {}} />)
    const tile = screen.getByRole('button', { name: current.label })
    expect(tile).toHaveAttribute('title', current.label)
    expect(tile).toHaveAttribute('aria-pressed', 'true')
    expect(tile).not.toHaveTextContent(current.label)
    expect(screen.getByRole('button', { name: other.label })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('applies a pack’s whole look when chosen', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<ThemePackPicker current={current.look} onSelect={onSelect} />)
    await user.click(screen.getByRole('button', { name: other.label }))
    expect(onSelect).toHaveBeenCalledWith(other.look)
  })
})
