import { Redo2, Undo2 } from 'lucide-react'
import { Button, LabeledRow, SwatchColorInput } from '../../design-system'
import {
  BackgroundMediaEffects,
  BackgroundMediaTile,
} from './BackgroundMediaSettings'
import type { useBackgroundMedia } from './useBackgroundMedia'
import type { usePageTheme } from './usePageTheme'

type PageThemeProps = {
  pageTheme: ReturnType<typeof usePageTheme>
}

type PageColorSettingsProps = PageThemeProps & {
  backgroundMedia: ReturnType<typeof useBackgroundMedia>
}

/**
 * The page's foreground (default text) and background colors, each a label
 * with its tile at the end (part of the App section); only the tiles open
 * pickers. The background row also holds the background picture or video,
 * followed by its blur and opacity while there's one. Picking a background
 * also picks a matching foreground, which can then be changed. A drag in a
 * picker is committed when it ends.
 */
export function PageColorSettings({
  pageTheme,
  backgroundMedia,
}: PageColorSettingsProps) {
  const { backgroundColor, textColor, changeBackground, changeText, commit } =
    pageTheme
  return (
    <>
      <LabeledRow label="Foreground" control="swatch">
        <SwatchColorInput
          value={textColor}
          label="Foreground"
          onChange={changeText}
          onCommit={commit}
        />
      </LabeledRow>
      <LabeledRow label="Background" control="swatch">
        <BackgroundMediaTile backgroundMedia={backgroundMedia} />
        <SwatchColorInput
          value={backgroundColor}
          label="Background color"
          onChange={changeBackground}
          onCommit={commit}
        />
      </LabeledRow>
      {backgroundMedia.media && (
        <BackgroundMediaEffects pageTheme={pageTheme} />
      )}
    </>
  )
}

/** One undo/redo for fonts and colors together. */
export function ThemeHistoryButtons({ pageTheme }: PageThemeProps) {
  const { canUndo, canRedo, undo, redo } = pageTheme
  return (
    <>
      <Button
        iconOnly
        aria-label="Undo font or color change"
        title="Undo font or color change"
        disabled={!canUndo}
        onClick={undo}
      >
        <Undo2 aria-hidden="true" />
      </Button>
      <Button
        iconOnly
        aria-label="Redo font or color change"
        title="Redo font or color change"
        disabled={!canRedo}
        onClick={redo}
      >
        <Redo2 aria-hidden="true" />
      </Button>
    </>
  )
}
