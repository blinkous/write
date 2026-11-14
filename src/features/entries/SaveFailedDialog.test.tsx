import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { reportSaveResult } from '../../lib/saveStatus'
import { SaveFailedDialog } from './SaveFailedDialog'

function renderDialog() {
  const handlers = {
    onExportAll: vi.fn(),
    onExportAllAsMarkdown: vi.fn(),
    onExportSettings: vi.fn(),
    onStatus: vi.fn(),
  }
  render(<SaveFailedDialog {...handlers} />)
  return handlers
}

const reportSave = (isSaved: boolean) =>
  act(() => reportSaveResult('entries', isSaved))

const queryDialog = () => screen.queryByRole('dialog', { name: 'Save failed' })

describe('SaveFailedDialog', () => {
  afterEach(() => reportSaveResult('entries', true))

  it('stays closed while saves work', () => {
    renderDialog()
    expect(queryDialog()).not.toBeInTheDocument()
  })

  it('offers the journal and settings exports when a save fails', async () => {
    const handlers = renderDialog()
    reportSave(false)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Export as JSON' }))
    await user.click(screen.getByRole('button', { name: 'Export as markdown' }))
    await user.click(screen.getByRole('button', { name: 'Export settings' }))
    expect(handlers.onExportAll).toHaveBeenCalledOnce()
    expect(handlers.onExportAllAsMarkdown).toHaveBeenCalledOnce()
    expect(handlers.onExportSettings).toHaveBeenCalledOnce()
    expect(queryDialog()).toBeInTheDocument()
  })

  it('takes focus itself, so a keystroke mid-typing presses no button', async () => {
    renderDialog()
    reportSave(false)
    expect(queryDialog()).toHaveFocus()
    await userEvent.setup().keyboard('{Enter} ')
    expect(queryDialog()).toBeInTheDocument()
  })

  it('stays dismissed until saving recovers and fails again', async () => {
    const { onStatus } = renderDialog()
    reportSave(false)
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Dismiss' }))
    reportSave(false)
    expect(queryDialog()).not.toBeInTheDocument()

    reportSave(true)
    expect(onStatus).toHaveBeenCalledWith(
      expect.objectContaining({ tone: 'neutral' }),
    )
    reportSave(false)
    expect(queryDialog()).toBeInTheDocument()
  })
})
