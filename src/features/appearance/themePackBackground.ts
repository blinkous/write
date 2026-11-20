import { z } from 'zod'
import {
  BACKGROUND_BLUR_RANGE,
  BACKGROUND_OPACITY_RANGE,
  BACKGROUND_VIDEO_SPEED_RANGE,
} from './appearanceOptions'
import type { StoredBackgroundFile } from './backgroundFiles'
import type { PageTheme } from './pageThemeHistory'

/** A background's blur, opacity and video playback. */
export type BackgroundEffects = Pick<
  PageTheme,
  | 'backgroundBlur'
  | 'backgroundOpacity'
  | 'isBackgroundVideoPaused'
  | 'backgroundVideoSpeed'
>

const BACKGROUND_EFFECT_NAMES = [
  'backgroundBlur',
  'backgroundOpacity',
  'isBackgroundVideoPaused',
  'backgroundVideoSpeed',
] as const satisfies readonly (keyof BackgroundEffects)[]

/** Just the background's effects from the page theme. */
export function pickBackgroundEffects(
  theme: BackgroundEffects,
): BackgroundEffects {
  const {
    backgroundBlur,
    backgroundOpacity,
    isBackgroundVideoPaused,
    backgroundVideoSpeed,
  } = theme
  return {
    backgroundBlur,
    backgroundOpacity,
    isBackgroundVideoPaused,
    backgroundVideoSpeed,
  }
}

/**
 * A pack is a whole look, background included. Choosing it shows the picture
 * or video it keeps (`file`, with its effects), or removes the current one
 * (`none`: saved without one, too big to keep, or imported from a settings
 * file). Curated packs have none. Undo brings back what was there.
 */
export type PackBackground =
  | ({ state: 'file' } & StoredBackgroundFile & { effects: BackgroundEffects })
  | { state: 'none' }

/** The current background as packs compare with it: which file (if any), what's known of it, and its effects. */
export type CurrentBackground = {
  fileId: string | null
  /** The shown file's kind and size, once it's read. */
  file: StoredBackgroundFile | null
  effects: BackgroundEffects
}

const MEGABYTE = 1024 * 1024

/**
 * Entries come first: pack backgrounds are capped well below what could crowd
 * them out. One pack keeps a file up to this size (a picture, or a short
 * looping video); the current background alone may be bigger.
 */
export const PACK_BACKGROUND_MAX_MEGABYTES = 25

/** Every pack's background together, counting a file shared by several packs once. */
export const PACK_BACKGROUNDS_BUDGET_MEGABYTES = 100

/**
 * Where the browser says how much room this site has, a pack only keeps a new
 * file while the site uses less than this share of it.
 */
export const PACK_BACKGROUNDS_MAX_STORAGE_SHARE = 0.5

const rangeSchema = ({ min, max }: { min: number; max: number }) =>
  z.number().min(min).max(max)

const backgroundEffectsSchema = z.object({
  backgroundBlur: rangeSchema(BACKGROUND_BLUR_RANGE),
  backgroundOpacity: rangeSchema(BACKGROUND_OPACITY_RANGE),
  isBackgroundVideoPaused: z.boolean(),
  backgroundVideoSpeed: rangeSchema(BACKGROUND_VIDEO_SPEED_RANGE),
})

/** A pack saved before packs kept backgrounds, or with an unreadable one, has none. */
export const packBackgroundSchema = z
  .discriminatedUnion('state', [
    z.object({
      state: z.literal('file'),
      fileId: z.string().min(1),
      kind: z.enum(['image', 'video']),
      bytes: z.number().int().nonnegative(),
      effects: backgroundEffectsSchema,
    }),
    z.object({ state: z.literal('none') }),
  ])
  .catch({ state: 'none' })

export type PackBackgroundRoom = {
  /** Backgrounds the other packs keep (a pack being updated isn't one of them). */
  otherPacks: readonly PackBackground[]
  /** What the browser reports, when it does. */
  storageEstimate: { usage: number; quota: number } | null
}

type PackBackgroundCheck = { fits: true } | { fits: false; problem: string }

function megabytes(bytes: number): string {
  return `${Math.ceil(bytes / MEGABYTE)} MB`
}

/** The files the packs keep, each once. */
export function getPackFiles(
  packs: readonly PackBackground[],
): Map<string, number> {
  const files = new Map<string, number>()
  for (const background of packs)
    if (background.state === 'file')
      files.set(background.fileId, background.bytes)
  return files
}

/**
 * What's left of the pack budget once the packs' own files are counted: undo
 * keeps recent backgrounds within it, so packs always come first.
 */
export function getUndoBackgroundBudgetBytes(
  packs: readonly PackBackground[],
): number {
  const packBytes = [...getPackFiles(packs).values()].reduce(
    (total, size) => total + size,
    0,
  )
  return Math.max(0, PACK_BACKGROUNDS_BUDGET_MEGABYTES * MEGABYTE - packBytes)
}

/** Whether a pack may keep this file, and if not, why (shown to the person). */
export function checkPackBackground(
  { fileId, bytes }: StoredBackgroundFile,
  { otherPacks, storageEstimate }: PackBackgroundRoom,
): PackBackgroundCheck {
  const keptFiles = getPackFiles(otherPacks)
  // Already kept for another pack: it takes no more room.
  if (keptFiles.has(fileId)) return { fits: true }
  if (bytes > PACK_BACKGROUND_MAX_MEGABYTES * MEGABYTE)
    return {
      fits: false,
      problem: `The background is ${megabytes(bytes)}, and a theme pack keeps one up to ${PACK_BACKGROUND_MAX_MEGABYTES} MB. Try a smaller picture or a shorter video.`,
    }
  const keptBytes = [...keptFiles.values()].reduce(
    (total, size) => total + size,
    0,
  )
  if (keptBytes + bytes > PACK_BACKGROUNDS_BUDGET_MEGABYTES * MEGABYTE)
    return {
      fits: false,
      problem: `Theme pack backgrounds can take up to ${PACK_BACKGROUNDS_BUDGET_MEGABYTES} MB together, so your entries always have room. Delete a pack with a background, or use a smaller file.`,
    }
  if (
    storageEstimate &&
    storageEstimate.usage >
      storageEstimate.quota * PACK_BACKGROUNDS_MAX_STORAGE_SHARE
  )
    return {
      fits: false,
      problem:
        'This browser is running low on room, and your entries come first. Delete a pack with a background to make room.',
    }
  return { fits: true }
}

/** What a pack saved now keeps of the current background. */
export function toPackBackground({
  file,
  effects,
}: CurrentBackground): PackBackground {
  return file ? { state: 'file', ...file, effects } : { state: 'none' }
}

/** Whether choosing a pack with this background would leave the current background as it is. */
export function matchesPackBackground(
  background: PackBackground,
  { fileId, effects }: CurrentBackground,
): boolean {
  if (background.state === 'none') return !fileId
  return (
    fileId === background.fileId &&
    BACKGROUND_EFFECT_NAMES.every(
      (effect) => effects[effect] === background.effects[effect],
    )
  )
}
