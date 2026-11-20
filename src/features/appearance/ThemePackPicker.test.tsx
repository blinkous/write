import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CustomThemePack } from './customThemePacks'
import type { BackgroundEffects } from './themePackBackground'
import { THEME_PACKS, type ThemeLook } from './themePacks'
import { ThemePackPicker } from './ThemePackPicker'
import type { BackgroundMedia } from './useBackgroundMedia'
import { useCustomThemePacks } from './useCustomThemePacks'
import type { usePageTheme } from './usePageTheme'

const [current, other] = THEME_PACKS
const savedLook: ThemeLook = { ...current.look, backgroundColor: '#123456' }
const savedPack: CustomThemePack = {
  id: 'saved',
  label: 'Custom 1',
  look: savedLook,
  background: { state: 'none' },
}
const EFFECTS: BackgroundEffects = {
  backgroundBlur: 0,
  backgroundOpacity: 50,
  isBackgroundVideoPaused: false,
  backgroundVideoSpeed: 1,
}
const MEGABYTE = 1024 * 1024
const picture = (fileId: string, megabytes = 1): BackgroundMedia => ({
  fileId,
  kind: 'image',
  bytes: megabytes * MEGABYTE,
  url: `blob:${fileId}`,
})

type PickerHarnessProps = {
  look: ThemeLook
  /** The background showing; its file is the background setting. */
  media: BackgroundMedia | null
  customPacks: CustomThemePack[]
  onCustomPacksChange: (packs: CustomThemePack[]) => void
  applyThemeLook: ReturnType<typeof usePageTheme>['applyThemeLook']
}

function PickerHarness({
  look,
  media,
  customPacks,
  onCustomPacksChange,
  applyThemeLook,
}: PickerHarnessProps) {
  const packActions = useCustomThemePacks({
    pageTheme: {
      ...look,
      ...EFFECTS,
      backgroundFileId: media?.fileId ?? null,
      applyThemeLook,
    },
    backgroundMedia: { media },
    customPacks,
    onCustomPacksChange,
  })
  return <ThemePackPicker customPacks={customPacks} packActions={packActions} />
}

function renderPicker({
  look = current.look,
  customPacks = [] as CustomThemePack[],
  media = null as BackgroundMedia | null,
} = {}) {
  const handlers = {
    onCustomPacksChange: vi.fn(),
    applyThemeLook: vi.fn(),
  }
  render(
    <PickerHarness
      look={look}
      media={media}
      customPacks={customPacks}
      {...handlers}
    />,
  )
  return handlers
}

const saveButton = () =>
  screen.getByRole('button', { name: 'Save current look as a theme pack' })

describe('ThemePackPicker', () => {
  it('names each pack only in its tooltip and accessible name, and shows the current one as chosen', () => {
    renderPicker()
    const tile = screen.getByRole('button', { name: current.label })
    expect(tile).toHaveAttribute('title', current.label)
    expect(tile).toHaveAttribute('aria-pressed', 'true')
    expect(tile).not.toHaveTextContent(current.label)
    expect(screen.getByRole('button', { name: other.label })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('applies a curated pack’s whole look, with no background, when chosen', async () => {
    const user = userEvent.setup()
    const { applyThemeLook } = renderPicker({ media: picture('pic') })
    await user.click(screen.getByRole('button', { name: other.label }))
    expect(applyThemeLook).toHaveBeenCalledWith({
      ...other.look,
      backgroundFileId: null,
    })
  })

  it('shows a curated pack as chosen only without a background', () => {
    renderPicker({ media: picture('pic') })
    expect(screen.getByRole('button', { name: current.label })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('saves the current look as a new pack, after the others', async () => {
    const user = userEvent.setup()
    const look = { ...current.look, textColor: '#010203' }
    const { onCustomPacksChange } = renderPicker({
      look,
      customPacks: [savedPack],
    })
    await user.click(saveButton())
    expect(onCustomPacksChange).toHaveBeenCalledWith([
      savedPack,
      expect.objectContaining({
        label: 'Custom 2',
        look,
        background: { state: 'none' },
      }),
    ])
  })

  it('keeps the background picture and its effects in a saved pack', async () => {
    const user = userEvent.setup()
    const { onCustomPacksChange } = renderPicker({ media: picture('pic') })
    await user.click(saveButton())
    expect(onCustomPacksChange).toHaveBeenCalledWith([
      expect.objectContaining({
        background: {
          state: 'file',
          fileId: 'pic',
          kind: 'image',
          bytes: MEGABYTE,
          effects: EFFECTS,
        },
      }),
    ])
  })

  it('keeps even a big background: it already counts toward the room backgrounds have', async () => {
    const user = userEvent.setup()
    const { onCustomPacksChange } = renderPicker({
      media: picture('big', 200),
    })
    await user.click(saveButton())
    expect(onCustomPacksChange).toHaveBeenCalledWith([
      expect.objectContaining({
        background: expect.objectContaining({ state: 'file', fileId: 'big' }),
      }),
    ])
  })

  it('always lets the current look be saved, even one a pack already has', async () => {
    const user = userEvent.setup()
    const { onCustomPacksChange } = renderPicker({
      look: savedLook,
      customPacks: [savedPack],
    })
    await user.click(saveButton())
    expect(onCustomPacksChange).toHaveBeenCalledWith([
      savedPack,
      expect.objectContaining({ label: 'Custom 2', look: savedLook }),
    ])
  })

  it('shows a pack as chosen only with its background showing', () => {
    const withPicture: CustomThemePack = {
      ...savedPack,
      background: {
        state: 'file',
        fileId: 'pic',
        kind: 'image',
        bytes: 1,
        effects: EFFECTS,
      },
    }
    renderPicker({ look: savedLook, customPacks: [withPicture] })
    expect(screen.getByRole('button', { name: 'Custom 1' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('brings back a pack’s background and its effects with its look', async () => {
    const user = userEvent.setup()
    const withPicture: CustomThemePack = {
      ...savedPack,
      background: {
        state: 'file',
        fileId: 'pic',
        kind: 'image',
        bytes: 1,
        effects: { ...EFFECTS, backgroundBlur: 4 },
      },
    }
    const { applyThemeLook } = renderPicker({ customPacks: [withPicture] })
    await user.click(screen.getByRole('button', { name: 'Custom 1' }))
    expect(applyThemeLook).toHaveBeenCalledWith({
      ...savedLook,
      ...EFFECTS,
      backgroundBlur: 4,
      backgroundFileId: 'pic',
    })
  })

  it('removes the background when choosing a pack saved without one', async () => {
    const user = userEvent.setup()
    const { applyThemeLook } = renderPicker({
      customPacks: [savedPack],
      media: picture('pic'),
    })
    await user.click(screen.getByRole('button', { name: 'Custom 1' }))
    expect(applyThemeLook).toHaveBeenCalledWith({
      ...savedLook,
      backgroundFileId: null,
    })
  })

  it('shows saved packs after the curated ones, each with its ⋯, and applies one when chosen', async () => {
    const user = userEvent.setup()
    const { applyThemeLook } = renderPicker({ customPacks: [savedPack] })
    const tiles = within(
      screen.getByRole('group', { name: 'Theme packs' }),
    ).getAllByRole('button', { pressed: false })
    expect(tiles.at(-1)).toHaveAccessibleName('Custom 1')
    expect(
      screen.getByRole('button', { name: 'Custom 1 options' }),
    ).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Custom 1' }))
    expect(applyThemeLook).toHaveBeenCalledWith({
      ...savedLook,
      backgroundFileId: null,
    })
  })

  it('updates a saved pack to the current look from its ⋯', async () => {
    const user = userEvent.setup()
    const { onCustomPacksChange } = renderPicker({ customPacks: [savedPack] })
    await user.click(screen.getByRole('button', { name: 'Custom 1 options' }))
    await user.click(
      // Popovers' contents count as hidden in jsdom (see TextStyleMenu.test).
      screen.getByRole('button', {
        name: 'Update pack to match',
        hidden: true,
      }),
    )
    expect(onCustomPacksChange).toHaveBeenCalledWith([
      { ...savedPack, look: current.look, background: { state: 'none' } },
    ])
  })

  it('deletes a saved pack only once confirmed', async () => {
    const user = userEvent.setup()
    const { onCustomPacksChange } = renderPicker({ customPacks: [savedPack] })
    const openDelete = async () => {
      await user.click(screen.getByRole('button', { name: 'Custom 1 options' }))
      await user.click(
        screen.getByRole('button', { name: 'Delete', hidden: true }),
      )
    }
    await openDelete()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCustomPacksChange).not.toHaveBeenCalled()

    await openDelete()
    const dialog = screen.getByRole('dialog', {
      name: 'Delete this theme pack?',
    })
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))
    expect(onCustomPacksChange).toHaveBeenCalledWith([])
  })
})
