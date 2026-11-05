import { saveTextFile } from './saveFile'

const options = {
  suggestedName: 'journal.json',
  text: '{}',
  mimeType: 'application/json',
  description: 'Journal export',
  extension: '.json',
} as const

afterEach(() => {
  delete window.showSaveFilePicker
  vi.restoreAllMocks()
})

describe('saveTextFile', () => {
  it('asks where to save and writes to the chosen file', async () => {
    const write = vi.fn()
    const showSaveFilePicker = vi.fn().mockResolvedValue({
      name: 'chosen-name.json',
      createWritable: async () => ({ write, close: vi.fn() }),
    })
    window.showSaveFilePicker = showSaveFilePicker
    await expect(saveTextFile(options)).resolves.toEqual({
      status: 'saved',
      fileName: 'chosen-name.json',
    })
    expect(showSaveFilePicker).toHaveBeenCalledWith(
      expect.objectContaining({ suggestedName: 'journal.json' }),
    )
    expect(write).toHaveBeenCalledWith('{}')
  })

  it('saves nothing when the dialog is cancelled', async () => {
    window.showSaveFilePicker = vi
      .fn()
      .mockRejectedValue(new DOMException('', 'AbortError'))
    await expect(saveTextFile(options)).resolves.toEqual({
      status: 'cancelled',
    })
  })

  it('reports other failures to the caller', async () => {
    window.showSaveFilePicker = vi
      .fn()
      .mockRejectedValue(new DOMException('', 'NotAllowedError'))
    await expect(saveTextFile(options)).rejects.toThrow()
  })

  it('falls back to a download where the dialog is unavailable', async () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    URL.createObjectURL = vi.fn(() => 'blob:test')
    URL.revokeObjectURL = vi.fn()
    await expect(saveTextFile(options)).resolves.toEqual({
      status: 'downloaded',
      fileName: 'journal.json',
    })
    expect(click).toHaveBeenCalled()
  })
})
