import { render, screen } from '@testing-library/react'
import { PrivacyNotice } from './PrivacyNotice'
import { SOURCE_CODE_URL, WELCOME_SIGN_OFF } from './privacyNotes'

describe('PrivacyNotice', () => {
  it('links to the source code in a new tab', () => {
    render(<PrivacyNotice isOpen onClose={() => {}} />)
    const link = screen.getByRole('link', {
      name: /^GitHub.*opens in a new tab/,
    })
    expect(link).toHaveAttribute('href', SOURCE_CODE_URL)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('focuses the sign-off on open, so Enter closes it', () => {
    render(<PrivacyNotice isOpen onClose={() => {}} />)
    expect(screen.getByRole('button', { name: WELCOME_SIGN_OFF })).toHaveFocus()
  })
})
