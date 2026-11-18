import { Pause, Play } from 'lucide-react'
import {
  Button,
  FileSwatch,
  LabeledRow,
  NestedRows,
  NumberStepper,
} from '../../design-system'
import {
  BACKGROUND_BLUR_RANGE,
  BACKGROUND_OPACITY_RANGE,
  BACKGROUND_VIDEO_SPEED_RANGE,
} from './appearanceOptions'
import {
  BACKGROUND_MEDIA_ACCEPT,
  type BackgroundMediaKind,
} from './backgroundMedia'
import type { useBackgroundMedia } from './useBackgroundMedia'
import type { usePageTheme } from './usePageTheme'

type BackgroundMediaControls = ReturnType<typeof useBackgroundMedia>

/** A small still of the background: the picture itself, or a video's first moment. */
function BackgroundMediaPreview({
  media: { url, kind },
}: {
  media: NonNullable<BackgroundMediaControls['media']>
}) {
  return kind === 'image' ? (
    <img src={url} alt="" />
  ) : (
    // #t=0.1: Safari shows a blank tile for a video's very start.
    <video src={`${url}#t=0.1`} muted playsInline preload="metadata" />
  )
}

/** A tile beside the background color: add a picture, GIF or video, or (once there's one) change or remove it. */
export function BackgroundMediaTile({
  backgroundMedia: { media, chooseFile, remove },
}: {
  backgroundMedia: BackgroundMediaControls
}) {
  return (
    <FileSwatch
      label="Background picture or video"
      accept={BACKGROUND_MEDIA_ACCEPT}
      preview={media && <BackgroundMediaPreview media={media} />}
      onFileSelected={chooseFile}
      onClear={remove}
    />
  )
}

type BackgroundMediaEffectsProps = {
  pageTheme: ReturnType<typeof usePageTheme>
  mediaKind: BackgroundMediaKind
}

/** A background video's play/pause and speed; each change is one undo step. */
function BackgroundVideoPlayback({
  pageTheme: {
    isBackgroundVideoPaused,
    backgroundVideoSpeed,
    changeBackgroundEffects,
  },
}: Pick<BackgroundMediaEffectsProps, 'pageTheme'>) {
  const playbackAction = isBackgroundVideoPaused ? 'Play' : 'Pause'
  return (
    <>
      <LabeledRow label="Playback" control="icon">
        <Button
          iconOnly
          variant="ghost"
          aria-label={`${playbackAction} background video`}
          title={playbackAction}
          onClick={() =>
            changeBackgroundEffects({
              isBackgroundVideoPaused: !isBackgroundVideoPaused,
            })
          }
        >
          {isBackgroundVideoPaused ? (
            <Play aria-hidden="true" />
          ) : (
            <Pause aria-hidden="true" />
          )}
        </Button>
      </LabeledRow>
      <LabeledRow label="Speed" control="icon">
        <NumberStepper
          label="Background video speed"
          value={backgroundVideoSpeed}
          {...BACKGROUND_VIDEO_SPEED_RANGE}
          unit="×"
          onChange={(speed) =>
            changeBackgroundEffects({ backgroundVideoSpeed: speed })
          }
        />
      </LabeledRow>
    </>
  )
}

/**
 * The background media's blur and opacity, plus a video's playback (shown
 * while there's one), indented under the Background row; each step is one
 * undo step.
 */
export function BackgroundMediaEffects({
  pageTheme,
  mediaKind,
}: BackgroundMediaEffectsProps) {
  const { backgroundBlur, backgroundOpacity, changeBackgroundEffects } =
    pageTheme
  return (
    <NestedRows label="Background picture or video">
      <LabeledRow label="Blur" control="icon">
        <NumberStepper
          label="Background blur"
          value={backgroundBlur}
          {...BACKGROUND_BLUR_RANGE}
          unit="px"
          onChange={(blur) => changeBackgroundEffects({ backgroundBlur: blur })}
        />
      </LabeledRow>
      <LabeledRow label="Opacity" control="icon">
        <NumberStepper
          label="Background opacity"
          value={backgroundOpacity}
          {...BACKGROUND_OPACITY_RANGE}
          unit="%"
          onChange={(opacity) =>
            changeBackgroundEffects({ backgroundOpacity: opacity })
          }
        />
      </LabeledRow>
      {mediaKind === 'video' && (
        <BackgroundVideoPlayback pageTheme={pageTheme} />
      )}
    </NestedRows>
  )
}
