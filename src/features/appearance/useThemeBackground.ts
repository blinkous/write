import type { ToastMessage } from '../../design-system'
import type { CustomThemePack } from './customThemePacks'
import { useBackgroundMedia } from './useBackgroundMedia'
import { useCustomThemePacks } from './useCustomThemePacks'
import type { usePageTheme } from './usePageTheme'

type ThemeBackgroundOptions = {
  pageTheme: ReturnType<typeof usePageTheme>
  customPacks: readonly CustomThemePack[]
  onCustomPacksChange: (customPacks: CustomThemePack[]) => void
  /** Corrects the background setting without an undo step. */
  onBackgroundFileReplaced: (fileId: string | null) => void
  onStatus: (message: ToastMessage) => void
}

/**
 * The background picture or video and the theme packs, which keep their own:
 * files are shared, and all of them together fit one budget so entries come
 * first.
 */
export function useThemeBackground({
  pageTheme,
  customPacks,
  onCustomPacksChange,
  onBackgroundFileReplaced,
  onStatus,
}: ThemeBackgroundOptions) {
  const backgroundMedia = useBackgroundMedia({
    fileId: pageTheme.backgroundFileId,
    onFileChange: pageTheme.changeBackgroundFile,
    onFileReplaced: onBackgroundFileReplaced,
    packBackgrounds: customPacks.map(({ background }) => background),
    onStatus,
  })
  const packActions = useCustomThemePacks({
    pageTheme,
    backgroundMedia,
    customPacks,
    onCustomPacksChange,
  })
  return { backgroundMedia, packActions }
}
