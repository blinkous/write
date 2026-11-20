import { z } from 'zod'
import { isFontValue, type FontValue } from '../../fonts'
import { textStylesSchema } from '../../text-styles'
import { isHexColor, isOpaqueHexColor } from '../../utils/color'
import {
  packBackgroundSchema,
  type PackBackground,
} from './themePackBackground'
import type { NamedThemeLook, ThemeLook } from './themePacks'

/** A look someone saved from their settings, with its background; shown after the curated packs. */
export type CustomThemePack = NamedThemeLook & { background: PackBackground }

/** Custom packs are named in the background (tooltip and accessible name only): "Custom 1", "Custom 2"… */
const CUSTOM_PACK_LABEL_PREFIX = 'Custom'

const themeLookSchema = z.object({
  appFont: z.custom<FontValue>(isFontValue),
  editorFont: z.custom<FontValue>(isFontValue),
  // The page background has nothing behind it, so it never has transparency.
  backgroundColor: z.string().refine(isOpaqueHexColor),
  textColor: z.string().refine(isHexColor),
  textStyles: textStylesSchema,
})

const customThemePackSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  look: themeLookSchema,
  background: packBackgroundSchema,
})

/**
 * Saved custom packs, in order. Each loads on its own: an unreadable one (or a
 * repeat of an id already read) is dropped rather than all of them.
 */
export const customThemePacksSchema = z
  .unknown()
  .optional()
  .transform((value): CustomThemePack[] => {
    if (!Array.isArray(value)) return []
    const packs: CustomThemePack[] = []
    for (const entry of value) {
      const result = customThemePackSchema.safeParse(entry)
      if (result.success && !packs.some(({ id }) => id === result.data.id))
        packs.push(result.data)
    }
    return packs
  })

/** The lowest "Custom N" no saved pack has, so names never repeat. */
function getNextCustomPackLabel(packs: readonly CustomThemePack[]): string {
  const labels = new Set(packs.map(({ label }) => label))
  let number = 1
  while (labels.has(`${CUSTOM_PACK_LABEL_PREFIX} ${number}`)) number += 1
  return `${CUSTOM_PACK_LABEL_PREFIX} ${number}`
}

type PackContents = { look: ThemeLook; background: PackBackground }

/** A new pack holding this look and background, after the others. */
export function addCustomThemePack(
  packs: readonly CustomThemePack[],
  contents: PackContents,
  createId: () => string = () => crypto.randomUUID(),
): CustomThemePack[] {
  return [
    ...packs,
    { id: createId(), label: getNextCustomPackLabel(packs), ...contents },
  ]
}

/** The pack takes this look and background; its place and name stay. */
export function updateCustomThemePack(
  packs: readonly CustomThemePack[],
  id: string,
  contents: PackContents,
): CustomThemePack[] {
  return packs.map((pack) => (pack.id === id ? { ...pack, ...contents } : pack))
}

export function deleteCustomThemePack(
  packs: readonly CustomThemePack[],
  id: string,
): CustomThemePack[] {
  return packs.filter((pack) => pack.id !== id)
}

/** For settings files, which don't carry background files: packs come back without theirs. */
export function withoutPackBackgroundFiles(
  packs: readonly CustomThemePack[],
): CustomThemePack[] {
  return packs.map((pack) => ({ ...pack, background: { state: 'none' } }))
}
