import { Redo2, Undo2 } from 'lucide-react'
import { useId } from 'react'
import { Button, LabeledRow, SwatchColorInput } from '../../design-system'
import type { usePageTheme } from './usePageTheme'

type PageThemeProps = {
  pageTheme: ReturnType<typeof usePageTheme>
}

/**
 * The page's background and default text color, each a label with its swatch
 * at the end (part of the App section).
 * Picking a background also picks a matching text color, which can then be
 * changed. A drag in a picker is committed when it ends.
 */
export function PageColorSettings({ pageTheme }: PageThemeProps) {
  const { backgroundColor, textColor, changeBackground, changeText, commit } =
    pageTheme
  const backgroundInputId = useId()
  const textInputId = useId()
  return (
    <>
      <LabeledRow
        label="Background"
        controlId={backgroundInputId}
        control="swatch"
      >
        <SwatchColorInput
          id={backgroundInputId}
          value={backgroundColor}
          label="Background"
          onChange={changeBackground}
          onCommit={commit}
        />
      </LabeledRow>
      <LabeledRow label="Text" controlId={textInputId} control="swatch">
        <SwatchColorInput
          id={textInputId}
          value={textColor}
          label="Text"
          onChange={changeText}
          onCommit={commit}
        />
      </LabeledRow>
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
