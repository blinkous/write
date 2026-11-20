import { Redo2, Undo2 } from 'lucide-react'
import { Button, ColorMenu, LabeledRow, SwatchFace } from '../../design-system'
import {
  BackgroundMediaEffects,
  BackgroundMediaTile,
  BackgroundRoomDialog,
  MISSING_BACKGROUND_MESSAGE,
} from './BackgroundMediaSettings'
import type { useBackgroundMedia } from './useBackgroundMedia'
import type { usePageTheme } from './usePageTheme'

type PageThemeProps = {
  pageTheme: ReturnType<typeof usePageTheme>
}

type CustomColorProps = {
  /** The custom color slots shared by every color menu. */
  customColors: readonly (string | null)[]
  onCustomColorsChange: (customColors: (string | null)[]) => void
}

type PageColorMenuProps = CustomColorProps & {
  label: string
  value: string
  /** Colors matching the other page color. */
  suggestions: readonly string[]
  allowsTransparency: boolean
  /** isFinal: one undo step now (a tile); otherwise when the picker commits. */
  onChange: (color: string, isFinal?: boolean) => void
  onCommit: () => void
}

/** A page color's tile, opening its color menu: matches for the other page color, custom colors, the picker. */
function PageColorMenu({
  label,
  value,
  suggestions,
  allowsTransparency,
  onChange,
  onCommit,
  ...customColorProps
}: PageColorMenuProps) {
  return (
    <ColorMenu
      label={label}
      trigger={<SwatchFace color={value} />}
      suggestionsLabel="Suggested colors"
      suggestions={suggestions.map((color, index) => ({
        color,
        label: `Suggested color ${index + 1}`,
        isSelected: color === value,
        onSelect: () => onChange(color, true),
      }))}
      value={value}
      pickerColor={value}
      allowsTransparency={allowsTransparency}
      onSelectCustom={(color) => onChange(color, true)}
      onPick={onChange}
      onPickEnd={onCommit}
      {...customColorProps}
    />
  )
}

type PageColorSettingsProps = PageThemeProps &
  CustomColorProps & {
    backgroundMedia: ReturnType<typeof useBackgroundMedia>
  }

/**
 * The page's foreground (default text) and background colors, each a label
 * with its tile at the end (part of the App section); a tile opens its color
 * menu, suggesting matches for the other color. The background row also holds
 * the background picture or video, followed by its blur and opacity (and a
 * video's playback) while there's one. Each color changes only when you change it.
 */
export function PageColorSettings({
  pageTheme,
  backgroundMedia,
  ...customColorProps
}: PageColorSettingsProps) {
  const {
    backgroundColor,
    textColor,
    textColorSuggestions,
    backgroundColorSuggestions,
    changeBackground,
    changeText,
    commit,
  } = pageTheme
  return (
    <>
      <LabeledRow label="Foreground" control="swatch">
        <PageColorMenu
          label="Foreground"
          value={textColor}
          suggestions={textColorSuggestions}
          allowsTransparency
          onChange={changeText}
          onCommit={commit}
          {...customColorProps}
        />
      </LabeledRow>
      <LabeledRow label="Background" control="swatch">
        <BackgroundMediaTile backgroundMedia={backgroundMedia} />
        <PageColorMenu
          label="Background color"
          value={backgroundColor}
          suggestions={backgroundColorSuggestions}
          allowsTransparency={false}
          onChange={changeBackground}
          onCommit={commit}
          {...customColorProps}
        />
      </LabeledRow>
      {/* Announces it when it happens (the tile says it too, with nothing more in the sidebar). */}
      <span className="visually-hidden" role="status">
        {backgroundMedia.isMissing && MISSING_BACKGROUND_MESSAGE}
      </span>
      <BackgroundRoomDialog backgroundMedia={backgroundMedia} />
      {backgroundMedia.media && (
        <BackgroundMediaEffects
          pageTheme={pageTheme}
          mediaKind={backgroundMedia.media.kind}
        />
      )}
    </>
  )
}

/** One undo/redo for every setting in the drawer's look, the background included (see pageThemeHistory). */
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
