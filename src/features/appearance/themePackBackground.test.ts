import {
  BACKGROUNDS_BUDGET_MEGABYTES,
  checkBackgroundRoom,
  matchesPackBackground,
  toPackBackground,
  type BackgroundEffects,
  type PackBackground,
} from './themePackBackground'

const MEGABYTE = 1024 * 1024
const EFFECTS: BackgroundEffects = {
  backgroundBlur: 0,
  backgroundOpacity: 50,
  isBackgroundVideoPaused: false,
  backgroundVideoSpeed: 1,
}
const file = (fileId: string, megabytes: number) => ({
  fileId,
  kind: 'image' as const,
  bytes: megabytes * MEGABYTE,
})
const kept = (fileId: string, megabytes: number): PackBackground => ({
  state: 'file',
  ...file(fileId, megabytes),
  effects: EFFECTS,
})
describe('checkBackgroundRoom', () => {
  it('takes a file that fits beside the packs’ files', () => {
    expect(checkBackgroundRoom(file('a', 5), [kept('b', 100)])).toEqual({
      fits: true,
    })
  })

  it('turns down a file bigger than all backgrounds may use, saying what to do', () => {
    const check = checkBackgroundRoom(
      file('a', BACKGROUNDS_BUDGET_MEGABYTES + 1),
      [],
    )
    expect(check.fits || check.problem).toMatch(/smaller picture/)
  })

  it('turns down a file that won’t fit beside the packs’ files, pointing to them', () => {
    const check = checkBackgroundRoom(file('new', 60), [
      kept('a', BACKGROUNDS_BUDGET_MEGABYTES - 50),
    ])
    expect(check.fits || check.problem).toMatch(/Delete a pack/)
  })

  it('counts a file shared by several packs once, and one a pack keeps as free', () => {
    const shared = kept('shared', 100)
    expect(checkBackgroundRoom(file('new', 100), [shared, shared])).toEqual({
      fits: true,
    })
    expect(
      checkBackgroundRoom(file('shared', 100), [kept('x', 200), shared]),
    ).toEqual({ fits: true })
  })
})

describe('matching the current background', () => {
  const current = { fileId: 'a', file: file('a', 1), effects: EFFECTS }
  const noBackground = { fileId: null, file: null, effects: EFFECTS }

  it('keeps the current file and effects, or none', () => {
    expect(toPackBackground(current)).toEqual(kept('a', 1))
    expect(toPackBackground(noBackground)).toEqual({ state: 'none' })
  })

  it('matches the same file with the same effects only', () => {
    expect(matchesPackBackground(kept('a', 1), current)).toBe(true)
    expect(matchesPackBackground(kept('b', 1), current)).toBe(false)
    expect(
      matchesPackBackground(kept('a', 1), {
        ...current,
        effects: { ...EFFECTS, backgroundBlur: 3 },
      }),
    ).toBe(false)
  })

  it('matches "none" only without a background', () => {
    expect(matchesPackBackground({ state: 'none' }, current)).toBe(false)
    expect(matchesPackBackground({ state: 'none' }, noBackground)).toBe(true)
  })
})
