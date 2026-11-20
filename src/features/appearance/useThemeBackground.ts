import type { ToastMessage } from '../../design-system'
import {
  getPackBackgroundFileIds,
  getOtherPackBackgrounds,
  type CustomThemePack,
} from './customThemePacks'
import { getUndoBackgroundBudgetBytes } from './themePackBackground'
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
 * files are shared, packs come first, and undo keeps recent backgrounds with
 * what's left of the packs' budget.
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
    packFileIds: getPackBackgroundFileIds(customPacks),
    undoFileIds: pageTheme.undoBackgroundFileIds,
    undoBudgetBytes: getUndoBackgroundBudgetBytes(
      getOtherPackBackgrounds(customPacks),
    ),
    onStatus,
  })
  const packActions = useCustomThemePacks({
    pageTheme,
    backgroundMedia,
    customPacks,
    onCustomPacksChange,
    onStatus,
  })
  return { backgroundMedia, packActions }
}
