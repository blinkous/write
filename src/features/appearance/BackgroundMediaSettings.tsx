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
  BACKGROUND_OPACITY_RANGE,
} from './appearanceOptions'
import { BACKGROUND_MEDIA_ACCEPT } from './backgroundMedia'

type BackgroundMediaSettingsProps = {
  hasMedia: boolean
  blur: number
  opacity: number
  onChooseFile: (file: File) => void
  onRemove: () => void
  onBlurChange: (blur: number) => void
  onOpacityChange: (opacity: number) => void
}

/** A picture, GIF or video behind the window: add, change or remove it, and while there's one, its blur and opacity. */
export function BackgroundMediaSettings({
  hasMedia,
  blur,
  opacity,
  onChooseFile,
  onRemove,
  onBlurChange,
  onOpacityChange,
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
          <LabeledRow label="Opacity" control="icon">
            <NumberStepper
              label="Background opacity"
              value={opacity}
              {...BACKGROUND_OPACITY_RANGE}
              unit="%"
              onChange={onOpacityChange}
            />
          </LabeledRow>
        </>
      )}
    </>
  )
}
