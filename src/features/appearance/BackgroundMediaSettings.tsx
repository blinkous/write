import { ImageOff, ImagePlus } from 'lucide-react'
import {
  ActionList,
  FileMenuItem,
  LabeledRow,
  MenuItem,
  NumberStepper,
} from '../../design-system'
import {
  BACKGROUND_BLUR_RANGE,
  BACKGROUND_FADE_RANGE,
} from './appearanceOptions'
import { BACKGROUND_MEDIA_ACCEPT } from './backgroundMedia'

type BackgroundMediaSettingsProps = {
  hasMedia: boolean
  blur: number
  fade: number
  onChooseFile: (file: File) => void
  onRemove: () => void
  onBlurChange: (blur: number) => void
  onFadeChange: (fade: number) => void
}

/** A picture, GIF or video behind the window: add, change or remove it, and while there's one, its blur and fade. */
export function BackgroundMediaSettings({
  hasMedia,
  blur,
  fade,
  onChooseFile,
  onRemove,
  onBlurChange,
  onFadeChange,
}: BackgroundMediaSettingsProps) {
  return (
    <>
      <ActionList>
        <FileMenuItem
          accept={BACKGROUND_MEDIA_ACCEPT}
          onFileSelected={onChooseFile}
        >
          <ImagePlus aria-hidden="true" />
          {hasMedia ? 'Change picture or video' : 'Add picture or video'}
        </FileMenuItem>
        {hasMedia && (
          <MenuItem onClick={onRemove}>
            <ImageOff aria-hidden="true" />
            Remove picture or video
          </MenuItem>
        )}
      </ActionList>
      {hasMedia && (
        <>
          <LabeledRow label="Blur" control="icon">
            <NumberStepper
              label="Background blur"
              value={blur}
              {...BACKGROUND_BLUR_RANGE}
              unit="px"
              onChange={onBlurChange}
            />
          </LabeledRow>
          <LabeledRow label="Fade" control="icon">
            <NumberStepper
              label="Background fade"
              value={fade}
              {...BACKGROUND_FADE_RANGE}
              unit="%"
              onChange={onFadeChange}
            />
          </LabeledRow>
        </>
      )}
    </>
  )
}
