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
 * Entries come first: every background together (the current one and each
 * pack's, a shared file counted once) takes up to this much. Writing takes a
 * few MB at most, so browsers always keep room for it.
 */
export const BACKGROUNDS_BUDGET_MEGABYTES = 250

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

function megabytes(bytes: number): string {
  return `${Math.ceil(bytes / MEGABYTE)} MB`
}

/** The files the packs keep, each once, with their sizes. */
function getPackFiles(packs: readonly PackBackground[]): Map<string, number> {
  const files = new Map<string, number>()
  for (const background of packs)
    if (background.state === 'file')
      files.set(background.fileId, background.bytes)
  return files
}

export type BackgroundRoomCheck =
  { fits: true } | { fits: false; problem: string }

/**
 * Whether a new background fits beside the packs' files (the one it replaces
 * isn't kept, unless a pack keeps it), and if not, why and what to do.
 */
export function checkBackgroundRoom(
  { fileId, bytes }: Pick<StoredBackgroundFile, 'fileId' | 'bytes'>,
  packs: readonly PackBackground[],
): BackgroundRoomCheck {
  const packFiles = getPackFiles(packs)
  // Already kept for a pack: it takes no more room.
  if (packFiles.has(fileId)) return { fits: true }
  const budget = BACKGROUNDS_BUDGET_MEGABYTES * MEGABYTE
  if (bytes > budget)
    return {
      fits: false,
      problem: `It’s ${megabytes(bytes)}, and backgrounds can use up to ${BACKGROUNDS_BUDGET_MEGABYTES} MB together, so your entries always have room. Try a smaller picture or a shorter video.`,
    }
  const packBytes = [...packFiles.values()].reduce(
    (total, size) => total + size,
    0,
  )
  if (packBytes + bytes > budget)
    return {
      fits: false,
      problem: `It’s ${megabytes(bytes)}, and your theme packs’ backgrounds already use ${megabytes(packBytes)} of the ${BACKGROUNDS_BUDGET_MEGABYTES} MB backgrounds can use together, so your entries always have room. Delete a pack with a background, or try a smaller file.`,
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
