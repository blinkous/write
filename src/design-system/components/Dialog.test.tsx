import { fireEvent, render, screen } from '@testing-library/react'
import { Dialog } from './Dialog'

const OUTSIDE = { clientX: 5, clientY: 5 }
const INSIDE = { clientX: 200, clientY: 200 }

function renderDialog({ opensUnprompted = false } = {}) {
  const onClose = vi.fn()
  render(
    <Dialog
      isOpen
      title="Export"
      actions={null}
      onClose={onClose}
      opensUnprompted={opensUnprompted}
    >
      <p>Body</p>
    </Dialog>,
  )
  const dialog = screen.getByRole('dialog', { hidden: true })
  // jsdom has no layout: give the dialog a box, so points can fall outside it.
  vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(100, 100, 300, 200),
  )
  return { dialog, onClose }
}

function press(
  element: Element,
  start: typeof OUTSIDE,
  end: typeof OUTSIDE = start,
) {
  fireEvent.pointerDown(element, start)
  fireEvent.pointerUp(element, end)
}

describe('Dialog', () => {
  afterEach(() => vi.restoreAllMocks())

  it.each([false, true])(
    'takes focus itself, so no button looks chosen before Tab (opens unprompted: %s)',
    (opensUnprompted) => {
      const { dialog } = renderDialog({ opensUnprompted })
      expect(dialog).toHaveFocus()
    },
  )

  it('closes on a click outside', () => {
    const { dialog, onClose } = renderDialog()
    press(dialog, INSIDE)
    expect(onClose).not.toHaveBeenCalled()
    press(dialog, OUTSIDE)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('stays open when a text selection is dragged out of it', () => {
    const { dialog, onClose } = renderDialog()
    press(dialog, INSIDE, OUTSIDE)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('stays open on a click outside when it opened by itself', () => {
    const { dialog, onClose } = renderDialog({ opensUnprompted: true })
    press(dialog, OUTSIDE)
    expect(onClose).not.toHaveBeenCalled()
  })
})
