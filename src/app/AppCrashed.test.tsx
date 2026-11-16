import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from 'react-error-boundary'
import { AppCrashed } from './AppCrashed'

function Crashing(): never {
  throw new Error('Cannot read properties of undefined')
}

describe('AppCrashed', () => {
  it('replaces a crashed app with a message, the error and Reload', () => {
    // React logs the caught error; keep the test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary FallbackComponent={AppCrashed}>
        <Crashing />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(
      screen.getByText('Cannot read properties of undefined'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
    vi.restoreAllMocks()
  })
})
