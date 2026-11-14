import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExportDialog } from './ExportDialog'

function renderExportDialog() {
  const handlers = {
    onClose: vi.fn(),
    onExportJournal: vi.fn(),
    onExportMarkdown: vi.fn(),
    onExportSettings: vi.fn(),
  }
  const view = render(<ExportDialog isOpen {...handlers} />)
  return { ...handlers, unmount: view.unmount }
}

const exportButton = () => screen.getByRole('button', { name: 'Export' })

describe('ExportDialog', () => {
  beforeEach(() => window.localStorage.clear())

  it('exports the journal and settings in one JSON file by default', async () => {
    const { onExportJournal, onClose } = renderExportDialog()
    await userEvent.setup().click(exportButton())
    expect(onExportJournal).toHaveBeenCalledWith({ includesSettings: true })
    expect(onClose).toHaveBeenCalled()
  })

  it('saves just the settings file when the journal is left out', async () => {
    const { onExportSettings, onExportJournal } = renderExportDialog()
    const user = userEvent.setup()
    await user.click(screen.getByRole('checkbox', { name: 'Journal' }))
    await user.click(exportButton())
    expect(onExportSettings).toHaveBeenCalledOnce()
    expect(onExportJournal).not.toHaveBeenCalled()
  })

  it('turns settings off for markdown, saying why', async () => {
    const { onExportMarkdown } = renderExportDialog()
    const user = userEvent.setup()
    await user.click(screen.getByRole('radio', { name: 'Markdown' }))
    const settings = screen.getByRole('checkbox', { name: 'Settings' })
    expect(settings).toBeDisabled()
    expect(settings).not.toBeChecked()
    expect(screen.getByText('Settings export as JSON only.')).toBeVisible()
    await user.click(exportButton())
    expect(onExportMarkdown).toHaveBeenCalledOnce()
  })

  it("can't export nothing", async () => {
    renderExportDialog()
    const user = userEvent.setup()
    await user.click(screen.getByRole('checkbox', { name: 'Journal' }))
    await user.click(screen.getByRole('checkbox', { name: 'Settings' }))
    expect(exportButton()).toBeDisabled()
  })

  it('remembers the choices for next time', async () => {
    const { unmount } = renderExportDialog()
    await userEvent
      .setup()
      .click(screen.getByRole('radio', { name: 'Markdown' }))
    unmount()
    renderExportDialog()
    expect(screen.getByRole('radio', { name: 'Markdown' })).toBeChecked()
  })
})
