import { useEffect, useRef } from 'react'
import type { ToastMessage } from '../../design-system'
import { getStorageEstimate } from '../../lib/storageEstimate'
import {
  addCustomThemePack,
  deleteCustomThemePack,
  getOtherPackBackgrounds,
  updateCustomThemePack,
  type CustomThemePack,
} from './customThemePacks'
import {
  checkPackBackground,
  matchesPackBackground,
  pickBackgroundEffects,
  toPackBackground,
  type BackgroundEffects,
  type CurrentBackground,
  type PackBackground,
} from './themePackBackground'
import {
  hasThemeLook,
  THEME_PACKS,
  type NamedThemeLook,
  type ThemeLook,
} from './themePacks'
import type { useBackgroundMedia } from './useBackgroundMedia'
import type { usePageTheme } from './usePageTheme'

const NO_BACKGROUND: PackBackground = { state: 'none' }

type CustomThemePacksOptions = {
  pageTheme: ThemeLook &
    BackgroundEffects &
    Pick<ReturnType<typeof usePageTheme>, 'applyThemeLook' | 'backgroundFileId'>
  backgroundMedia: Pick<ReturnType<typeof useBackgroundMedia>, 'media'>
  customPacks: readonly CustomThemePack[]
  onCustomPacksChange: (customPacks: CustomThemePack[]) => void
  onStatus: (message: ToastMessage) => void
}

/**
 * Saving, choosing, updating and deleting theme packs, background included.
 * A background too big for the limits is left out (and said so); entries
 * always come first.
 */
export function useCustomThemePacks({
  pageTheme,
  backgroundMedia,
  customPacks,
  onCustomPacksChange,
  onStatus,
}: CustomThemePacksOptions) {
  const { appFont, editorFont, backgroundColor, textColor, textStyles } =
    pageTheme
  const currentLook = {
    appFont,
    editorFont,
    backgroundColor,
    textColor,
    textStyles,
  }
  const { media } = backgroundMedia
  const current: CurrentBackground = {
    fileId: pageTheme.backgroundFileId,
    file: media && {
      fileId: media.fileId,
      kind: media.kind,
      bytes: media.bytes,
    },
    effects: pickBackgroundEffects(pageTheme),
  }
  // Saving waits on the browser; the latest packs, and one save at a time (a double click saves once).
  const customPacksRef = useRef(customPacks)
  const isSavingRef = useRef(false)

  useEffect(() => {
    customPacksRef.current = customPacks
  })

  /** Whether choosing this pack would change nothing. */
  function reproducesCurrent(
    pack: NamedThemeLook,
    background: PackBackground,
  ): boolean {
    return (
      hasThemeLook(currentLook, pack) &&
      matchesPackBackground(background, current)
    )
  }

  /** The current background, for a pack saved now, if it fits the limits; otherwise left out, and said so. */
  async function getBackgroundToKeep(
    exceptPackId?: string,
  ): Promise<PackBackground> {
    if (!current.file) return toPackBackground(current)
    const check = checkPackBackground(current.file, {
      otherPacks: getOtherPackBackgrounds(customPacksRef.current, exceptPackId),
      storageEstimate: await getStorageEstimate(),
    })
    if (check.fits) return toPackBackground(current)
    onStatus({
      text: `Saved the theme pack without its background. ${check.problem}`,
      tone: 'warning',
    })
    return NO_BACKGROUND
  }

  async function save(
    change: (background: PackBackground) => void,
    exceptPackId?: string,
  ) {
    if (isSavingRef.current) return
    isSavingRef.current = true
    try {
      change(await getBackgroundToKeep(exceptPackId))
    } finally {
      isSavingRef.current = false
    }
  }

  return {
    /** Shows as chosen while the settings are its look, background included (curated packs have none). */
    isCuratedChosen: (pack: NamedThemeLook) =>
      reproducesCurrent(pack, NO_BACKGROUND),
    isChosen: (pack: CustomThemePack) =>
      reproducesCurrent(pack, pack.background),
    /** Off while a pack already brings back exactly what's showing. */
    canSaveCurrent: !(
      THEME_PACKS.some((pack) => reproducesCurrent(pack, NO_BACKGROUND)) ||
      customPacks.some((pack) => reproducesCurrent(pack, pack.background))
    ),
    canUpdate: (pack: CustomThemePack) =>
      !reproducesCurrent(pack, pack.background),
    /** A curated pack's look, with no background: one undo step. */
    chooseCurated: ({ look }: NamedThemeLook) =>
      pageTheme.applyThemeLook({ ...look, backgroundFileId: null }),
    /** The pack's look and background together: one undo step, shown at once. */
    choose: ({ look, background }: CustomThemePack) =>
      pageTheme.applyThemeLook(
        background.state === 'file'
          ? {
              ...look,
              ...background.effects,
              backgroundFileId: background.fileId,
            }
          : { ...look, backgroundFileId: null },
      ),
    saveCurrent: () =>
      save((background) =>
        onCustomPacksChange(
          addCustomThemePack(customPacksRef.current, {
            look: currentLook,
            background,
          }),
        ),
      ),
    updateToCurrent: (id: string) =>
      save(
        (background) =>
          onCustomPacksChange(
            updateCustomThemePack(customPacksRef.current, id, {
              look: currentLook,
              background,
            }),
          ),
        id,
      ),
    delete: (id: string) =>
      onCustomPacksChange(deleteCustomThemePack(customPacksRef.current, id)),
  }
}
