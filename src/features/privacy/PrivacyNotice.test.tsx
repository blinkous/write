import { render, screen } from '@testing-library/react'
import { PrivacyNotice } from './PrivacyNotice'
import { SOURCE_CODE_URL } from './privacyNotes'

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
})
