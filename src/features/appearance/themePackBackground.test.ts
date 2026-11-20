import {
  checkPackBackground,
  getUndoBackgroundBudgetBytes,
  matchesPackBackground,
  PACK_BACKGROUND_MAX_MEGABYTES,
  PACK_BACKGROUNDS_BUDGET_MEGABYTES,
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
const noEstimate = { storageEstimate: null }

describe('checkPackBackground', () => {
  it('lets a pack keep a file within the limits', () => {
    expect(
      checkPackBackground(file('a', 5), { otherPacks: [], ...noEstimate }),
    ).toEqual({ fits: true })
  })

  it('refuses a file over the per-pack limit, saying what to do', () => {
    const check = checkPackBackground(
      file('a', PACK_BACKGROUND_MAX_MEGABYTES + 1),
      { otherPacks: [], ...noEstimate },
    )
    expect(check).toMatchObject({ fits: false })
    expect(check.fits || check.problem).toMatch(/smaller picture/)
  })

  it('refuses a file that would take the packs past their budget together', () => {
    const otherPacks = Array.from(
      { length: PACK_BACKGROUNDS_BUDGET_MEGABYTES / 20 },
      (_, index) => kept(`f${index}`, 20),
    )
    const check = checkPackBackground(file('new', 1), {
      otherPacks,
      ...noEstimate,
    })
    expect(check.fits || check.problem).toMatch(/Delete a pack/)
  })

  it('counts a file shared by several packs once, and a file already kept as free', () => {
    const shared = kept('shared', 20)
    const otherPacks = [shared, shared, shared, shared, shared, shared]
    expect(
      checkPackBackground(file('new', 20), { otherPacks, ...noEstimate }),
    ).toEqual({ fits: true })
    expect(
      checkPackBackground(file('shared', 20), {
        otherPacks: [kept('x', 90), shared],
        ...noEstimate,
      }),
    ).toEqual({ fits: true })
  })

  it('puts entries first when the browser reports the site is using over half its room', () => {
    const check = checkPackBackground(file('a', 1), {
      otherPacks: [],
      storageEstimate: { usage: 60, quota: 100 },
    })
    expect(check.fits || check.problem).toMatch(/entries come first/)
    expect(
      checkPackBackground(file('a', 1), {
        otherPacks: [],
        storageEstimate: { usage: 40, quota: 100 },
      }),
    ).toEqual({ fits: true })
  })
})

describe('getUndoBackgroundBudgetBytes', () => {
  it('leaves undo what the packs’ own files don’t use, each file counted once', () => {
    expect(getUndoBackgroundBudgetBytes([kept('a', 10), kept('a', 10)])).toBe(
      (PACK_BACKGROUNDS_BUDGET_MEGABYTES - 10) * MEGABYTE,
    )
    expect(getUndoBackgroundBudgetBytes([{ state: 'none' }])).toBe(
      PACK_BACKGROUNDS_BUDGET_MEGABYTES * MEGABYTE,
    )
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
