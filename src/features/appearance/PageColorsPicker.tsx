import { Palette, Redo2, Undo2 } from 'lucide-react'
import { useId } from 'react'
import {
  Button,
  LabeledSwatch,
  MenuFooter,
  Popover,
  PopoverPanel,
  SwatchColorInput,
} from '../../design-system'
import type { usePageColors } from './usePageColors'

type PageColorsPickerProps = {
  pageColors: ReturnType<typeof usePageColors>
}

/**
 * Page-wide background and default text color, as swatches like the text
 * color menu. Picking a background also picks a matching text color, which
 * can then be changed. Small undo/redo icons cover recent color changes.
 */
export function PageColorsPicker({ pageColors }: PageColorsPickerProps) {
  const {
    backgroundColor,
    textColor,
    changeBackground,
    changeText,
    commit,
    canUndo,
    canRedo,
    undo,
    redo,
  } = pageColors
  const backgroundInputId = useId()
  const textInputId = useId()

  return (
    <Popover
      label="Page colors"
      align="start"
      trigger={<Palette aria-hidden="true" />}
      onClose={commit}
    >
      <PopoverPanel>
        <LabeledSwatch inputId={backgroundInputId} label="Background">
          <SwatchColorInput
            id={backgroundInputId}
            value={backgroundColor}
            label="Background"
            onChange={changeBackground}
            onCommit={commit}
          />
        </LabeledSwatch>
        <LabeledSwatch inputId={textInputId} label="Text">
          <SwatchColorInput
            id={textInputId}
            value={textColor}
            label="Text"
            onChange={changeText}
            onCommit={commit}
          />
        </LabeledSwatch>
        <MenuFooter>
          <Button
            iconOnly
            aria-label="Undo color change"
            title="Undo color change"
            disabled={!canUndo}
            onClick={undo}
          >
            <Undo2 aria-hidden="true" />
          </Button>
          <Button
            iconOnly
            aria-label="Redo color change"
            title="Redo color change"
            disabled={!canRedo}
            onClick={redo}
          >
            <Redo2 aria-hidden="true" />
          </Button>
        </MenuFooter>
      </PopoverPanel>
    </Popover>
  )
}
