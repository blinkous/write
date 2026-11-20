import {
  addCustomThemePack,
  deleteCustomThemePack,
  updateCustomThemePack,
  type CustomThemePack,
} from './customThemePacks'
import {
  matchesPackBackground,
  pickBackgroundEffects,
  toPackBackground,
  type BackgroundEffects,
  type CurrentBackground,
  type PackBackground,
} from './themePackBackground'
import { hasThemeLook, type NamedThemeLook, type ThemeLook } from './themePacks'
import type { useBackgroundMedia } from './useBackgroundMedia'
import type { usePageTheme } from './usePageTheme'

const NO_BACKGROUND: PackBackground = { state: 'none' }

type CustomThemePacksOptions = {
  pageTheme: ThemeLook &
    BackgroundEffects &
    Pick<ReturnType<typeof usePageTheme>, 'applyThemeLook' | 'backgroundFileId'>
  backgroundMedia: Pick<
    ReturnType<typeof useBackgroundMedia>,
    'media' | 'getShownFile'
  >
  customPacks: readonly CustomThemePack[]
  onCustomPacksChange: (customPacks: CustomThemePack[]) => void
}

/**
 * Saving, choosing, updating and deleting theme packs, background included.
 * Saving always fits: the current background already counts toward the room
 * backgrounds have (see checkBackgroundRoom).
 */
export function useCustomThemePacks({
  pageTheme,
  backgroundMedia,
  customPacks,
  onCustomPacksChange,
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

  const contents = { look: currentLook, background: toPackBackground(current) }

  return {
    /** Shows as chosen while the settings are its look, background included (curated packs have none). */
    isCuratedChosen: (pack: NamedThemeLook) =>
      reproducesCurrent(pack, NO_BACKGROUND),
    isChosen: (pack: CustomThemePack) =>
      reproducesCurrent(pack, pack.background),
    /** A saved pack's picture or video for its tile, with how opaque it's shown, once it's read. */
    getTileBackground: ({ background }: CustomThemePack) => {
      if (background.state !== 'file') return null
      const shown = backgroundMedia.getShownFile(background.fileId)
      return (
        shown && { media: shown, opacity: background.effects.backgroundOpacity }
      )
    },
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
      onCustomPacksChange(addCustomThemePack(customPacks, contents)),
    updateToCurrent: (id: string) =>
      onCustomPacksChange(updateCustomThemePack(customPacks, id, contents)),
    delete: (id: string) =>
      onCustomPacksChange(deleteCustomThemePack(customPacks, id)),
  }
}
