import { DEFAULT_TEXT_STYLES } from '../../text-styles'
import {
  addCustomThemePack,
  customThemePacksSchema,
  deleteCustomThemePack,
  updateCustomThemePack,
  withoutPackBackgroundFiles,
  type CustomThemePack,
} from './customThemePacks'
import type { ThemeLook } from './themePacks'

const look = (backgroundColor: string): ThemeLook => ({
  appFont: 'inter',
  editorFont: 'lora',
  backgroundColor,
  textColor: '#111111',
  textStyles: DEFAULT_TEXT_STYLES,
})
const pack = (id: string, label: string): CustomThemePack => ({
  id,
  label,
  look: look('#aaaaaa'),
  background: { state: 'none' },
})
const EFFECTS = {
  backgroundBlur: 2,
  backgroundOpacity: 60,
  isBackgroundVideoPaused: false,
  backgroundVideoSpeed: 1,
}

describe('custom theme packs', () => {
  it('reads nothing saved as no packs', () => {
    expect(customThemePacksSchema.parse(undefined)).toEqual([])
    expect(customThemePacksSchema.parse('nope')).toEqual([])
  })

  it('keeps each readable pack, dropping bad ones and repeated ids', () => {
    const first = pack('a', 'Custom 1')
    const saved = [
      first,
      { ...pack('b', 'Custom 2'), look: { ...look('#aaaaaa'), appFont: 'x' } },
      { ...pack('c', 'Custom 3'), look: look('#aaaaaa80') },
      { id: 'd' },
      pack('a', 'Custom 4'),
      pack('e', 'Custom 5'),
    ]
    expect(customThemePacksSchema.parse(saved)).toEqual([
      first,
      pack('e', 'Custom 5'),
    ])
  })

  it('names a new pack with the lowest free number, after the others', () => {
    const packs = [pack('a', 'Custom 1'), pack('c', 'Custom 3')]
    const contents = {
      look: look('#bbbbbb'),
      background: { state: 'none' } as const,
    }
    expect(addCustomThemePack(packs, contents, () => 'b')).toEqual([
      ...packs,
      { id: 'b', label: 'Custom 2', ...contents },
    ])
  })

  it('updates only that pack’s look and background, keeping its place and name', () => {
    const packs = [pack('a', 'Custom 1'), pack('b', 'Custom 2')]
    const contents = {
      look: look('#cccccc'),
      background: { state: 'none' } as const,
    }
    expect(updateCustomThemePack(packs, 'a', contents)).toEqual([
      { id: 'a', label: 'Custom 1', ...contents },
      packs[1],
    ])
  })

  it('reads a pack saved without a background (or an unreadable one) as having none', () => {
    const { background: _background, ...withoutBackground } = pack(
      'a',
      'Custom 1',
    )
    const saved = [
      withoutBackground,
      { ...pack('b', 'Custom 2'), background: { state: 'file', bytes: -1 } },
    ]
    expect(
      customThemePacksSchema.parse(saved).map(({ background }) => background),
    ).toEqual([{ state: 'none' }, { state: 'none' }])
  })

  it('keeps a saved background file and its effects', () => {
    const background = {
      state: 'file',
      fileId: 'f1',
      kind: 'image',
      bytes: 10,
      effects: EFFECTS,
    } as const
    const saved = [{ ...pack('a', 'Custom 1'), background }]
    expect(customThemePacksSchema.parse(saved)[0].background).toEqual(
      background,
    )
  })

  it('leaves files out of settings files: packs come back without backgrounds', () => {
    const withFile: CustomThemePack = {
      ...pack('a', 'Custom 1'),
      background: {
        state: 'file',
        fileId: 'f1',
        kind: 'video',
        bytes: 10,
        effects: EFFECTS,
      },
    }
    const withNone = pack('b', 'Custom 2')
    expect(withoutPackBackgroundFiles([withFile, withNone])).toEqual([
      { ...withFile, background: { state: 'none' } },
      withNone,
    ])
  })

  it('deletes only that pack', () => {
    const packs = [pack('a', 'Custom 1'), pack('b', 'Custom 2')]
    expect(deleteCustomThemePack(packs, 'a')).toEqual([packs[1]])
  })
})
