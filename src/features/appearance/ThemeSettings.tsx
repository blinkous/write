import { Redo2, Undo2 } from 'lucide-react'
import { useId } from 'react'
import { Button, LabeledRow, SwatchColorInput } from '../../design-system'
import { FontMenu } from '../../fonts'
import type { usePageTheme } from './usePageTheme'

type PageThemeProps = {
  pageTheme: ReturnType<typeof usePageTheme>
}

/** The app's font (everything around the page) and the editor's (the writing and title). */
export function FontSettings({ pageTheme }: PageThemeProps) {
  const { appFont, editorFont, changeFonts } = pageTheme
  return (
    <>
      <LabeledRow label="App" control="button">
        <FontMenu
          label="App font"
          value={appFont}
          onChange={(font) => font && changeFonts({ appFont: font })}
        />
      </LabeledRow>
      <LabeledRow label="Editor" control="button">
        <FontMenu
          label="Editor font"
          value={editorFont}
          onChange={(font) => font && changeFonts({ editorFont: font })}
        />
      </LabeledRow>
    </>
  )
}

/**
 * Background and default text color, each a label with its swatch at the end.
 * Picking a background also picks a matching text color, which can then be
 * changed. A drag in a picker is committed when it ends.
 */
export function ColorSettings({ pageTheme }: PageThemeProps) {
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
