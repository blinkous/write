import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  BackgroundMediaTile,
  BackgroundRoomDialog,
} from './BackgroundMediaSettings'

function controls({ isMissing = false, roomProblem = null as string | null }) {
  return {
    media: null,
    isMissing,
    chooseFile: vi.fn(async () => {}),
    remove: vi.fn(),
    getShownFile: () => null,
    roomProblem,
    dismissRoomProblem: vi.fn(),
  }
}

function renderTile(isMissing: boolean) {
  const backgroundMedia = controls({ isMissing })
  render(<BackgroundMediaTile backgroundMedia={backgroundMedia} />)
  return backgroundMedia
}

describe('BackgroundMediaTile', () => {
  it('offers to add a background while there’s none', () => {
    renderTile(false)
    expect(
      screen.getByRole('button', { name: 'Add background picture or video' }),
    ).toBeInTheDocument()
  })

  it('describes a missing background as not found, and keeps it changeable and removable', async () => {
    const user = userEvent.setup()
    const { remove } = renderTile(true)
    const tile = screen.getByRole('button', {
      name: 'Change background picture or video',
    })
    expect(tile).toHaveAccessibleDescription('Not found')
    await user.click(
      screen.getByRole('button', {
        name: 'Remove background picture or video',
      }),
    )
    expect(remove).toHaveBeenCalled()
  })
})

describe('BackgroundRoomDialog', () => {
  it('says why a background wasn’t used, until acknowledged', async () => {
    const user = userEvent.setup()
    const backgroundMedia = controls({ roomProblem: 'Delete a pack.' })
    render(<BackgroundRoomDialog backgroundMedia={backgroundMedia} />)
    const dialog = screen.getByRole('dialog', {
      name: 'Not enough room for this background',
    })
    expect(dialog).toHaveTextContent('Delete a pack.')
    await user.click(screen.getByRole('button', { name: 'OK' }))
    expect(backgroundMedia.dismissRoomProblem).toHaveBeenCalled()
  })

  it('stays closed while there’s room', () => {
    render(<BackgroundRoomDialog backgroundMedia={controls({})} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
