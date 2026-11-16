import { Redo2, Sparkles, Undo2 } from 'lucide-react'
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
 * followed by its blur and opacity while there's one. Each color changes
 * only when you change it; the ✨ before a tile picks a match for the other
 * color, once. A drag in a picker is committed when it ends.
 */
export function PageColorSettings({
  pageTheme,
  backgroundMedia,
}: PageColorSettingsProps) {
  const {
    backgroundColor,
    textColor,
    changeBackground,
    changeText,
    matchText,
    matchBackground,
    commit,
  } = pageTheme
  return (
    <>
      <LabeledRow label="Foreground" control="swatch">
        <MatchColorButton
          label="Match foreground to background"
          onClick={matchText}
        />
        <SwatchColorInput
          value={textColor}
          label="Foreground"
          onChange={changeText}
          onCommit={commit}
        />
      </LabeledRow>
      <LabeledRow label="Background" control="swatch">
        <BackgroundMediaTile backgroundMedia={backgroundMedia} />
        <MatchColorButton
          label="Match background to foreground"
          onClick={matchBackground}
        />
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

type MatchColorButtonProps = {
  label: string
  onClick: () => void
}

/** ✨ before a color tile: picks a color matching the other page color, once. */
function MatchColorButton({ label, onClick }: MatchColorButtonProps) {
  return (
    <Button iconOnly aria-label={label} title={label} onClick={onClick}>
      <Sparkles aria-hidden="true" />
    </Button>
  )
}

/** One undo/redo for every setting except the background file (see pageThemeHistory). */
export function ThemeHistoryButtons({ pageTheme }: PageThemeProps) {
  const { canUndo, canRedo, undo, redo } = pageTheme
  return (
    <>
      <Button
        iconOnly
        aria-label="Undo settings change"
        title="Undo settings change"
        disabled={!canUndo}
        onClick={undo}
      >
        <Undo2 aria-hidden="true" />
      </Button>
      <Button
        iconOnly
        aria-label="Redo settings change"
        title="Redo settings change"
        disabled={!canRedo}
        onClick={redo}
      >
        <Redo2 aria-hidden="true" />
      </Button>
    </>
  )
}
