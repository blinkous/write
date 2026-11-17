import type { Mark, Schema } from '@tiptap/pm/model'
import type { Editor } from '@tiptap/react'
import {
  AS_TYPED_CASE,
  EMPHASES,
  EMPHASIS_OFF_ATTRIBUTES,
  isEmphasisShown,
  NO_GLOW,
  THEME_TEXT_COLORS,
  isOwnTextCase,
  type Emphasis,
  type OwnTextCase,
  type TextCase,
} from '../../journal-document'
import type { FontValue } from '../../fonts'
import type { TextStyleName, TextStyleSettings } from '../../text-styles'
import type { TextStyleContext } from './ownOrStyleValue'
import {
  readOwnColor,
  readOwnFont,
  readOwnGlow,
  readOwnLetterSpacing,
  readOwnTextCase,
} from './ownFormatting'
import { getBlockTextStyleName, getTextStyleNameAt } from './textStyles'

/** What matching sets: everything but size, which only a style has. */
export type TextStyleLook = Omit<TextStyleSettings, 'size'>

const [PAGE_TEXT_THEME_COLOR] = THEME_TEXT_COLORS

/*
 * Text's own "none" values (the page text color, no glow, as typed) as a
 * style holds them: null. Everything else is held as is.
 */
const toStyleColor = (color: string | null) =>
  color === PAGE_TEXT_THEME_COLOR ? null : color
const toStyleGlow = (glow: string | null) => (glow === NO_GLOW ? null : glow)
const toStyleCase = (textCase: OwnTextCase): TextCase | null =>
  textCase === AS_TYPED_CASE ? null : textCase

/**
 * How the selected text (or the text at the cursor) looks: its own formatting,
 * or its style's where it has none. Exactly what the toolbar shows.
 */
export function readShownLook(
  editor: Editor,
  { isTitle, textStyles }: TextStyleContext,
): TextStyleLook {
  const style = textStyles[getTextStyleNameAt(editor, isTitle)]
  const ownColor = readOwnColor(editor)
  const ownGlow = readOwnGlow(editor)
  const ownCase = readOwnTextCase(editor)
  return {
    font: readOwnFont(editor) ?? style.font,
    color: ownColor === null ? style.color : toStyleColor(ownColor),
    glow: ownGlow === null ? style.glow : toStyleGlow(ownGlow),
    textCase: ownCase === null ? style.textCase : toStyleCase(ownCase),
    letterSpacing: readOwnLetterSpacing(editor) ?? style.letterSpacing,
    bold: isEmphasisShown(editor, 'bold'),
    italic: isEmphasisShown(editor, 'italic'),
    underline: isEmphasisShown(editor, 'underline'),
    strike: isEmphasisShown(editor, 'strike'),
  }
}

/** The marks this module rewrites: the text style mark, case and the emphasis marks. */
const isLookMark = ({ type }: Mark) =>
  type.name === 'textStyle' ||
  type.name === 'textCase' ||
  EMPHASES.some((emphasis) => emphasis === type.name)

/** How text with these marks looks in a block of this style. */
function readLook(
  marks: readonly Mark[],
  style: TextStyleSettings,
): TextStyleLook {
  const attributes =
    marks.find(({ type }) => type.name === 'textStyle')?.attrs ?? {}
  const ownCase = marks.find(({ type }) => type.name === 'textCase')?.attrs
    .textCase
  const hasMark = (emphasis: Emphasis) =>
    marks.some(({ type }) => type.name === emphasis)
  const isShown = (emphasis: Emphasis) =>
    hasMark(emphasis) ||
    (style[emphasis] && attributes[EMPHASIS_OFF_ATTRIBUTES[emphasis]] !== true)
  return {
    font: attributes.font ?? style.font,
    color:
      typeof attributes.color === 'string'
        ? toStyleColor(attributes.color)
        : style.color,
    glow:
      typeof attributes.glow === 'string'
        ? toStyleGlow(attributes.glow)
        : style.glow,
    textCase: isOwnTextCase(ownCase) ? toStyleCase(ownCase) : style.textCase,
    letterSpacing:
      typeof attributes.letterSpacing === 'number'
        ? attributes.letterSpacing
        : style.letterSpacing,
    bold: isShown('bold'),
    italic: isShown('italic'),
    underline: isShown('underline'),
    strike: isShown('strike'),
  }
}

/**
 * The marks that give text this look in a block of this style: only what
 * differs from the style is its own ("none" values included, e.g. no glow).
 */
function marksForLook(
  look: TextStyleLook,
  style: TextStyleSettings,
  schema: Schema,
  editorFont: FontValue,
  /** The text style mark's current attributes; those for its look are replaced. */
  currentAttributes: Record<string, unknown>,
): Mark[] {
  const own = <Value>(value: Value, styleValue: Value, none: Value) =>
    value === styleValue ? null : (value ?? none)
  const textStyleAttributes: Record<string, unknown> = {
    ...currentAttributes,
    // Null is the editor font, so it's stored by name where the style has another.
    font: own(look.font, style.font, editorFont),
    color: own(look.color, style.color, PAGE_TEXT_THEME_COLOR),
    glow: own(look.glow, style.glow, NO_GLOW),
    letterSpacing: own(look.letterSpacing, style.letterSpacing, null),
    ...Object.fromEntries(
      EMPHASES.map((emphasis) => [
        EMPHASIS_OFF_ATTRIBUTES[emphasis],
        style[emphasis] && !look[emphasis] ? true : null,
      ]),
    ),
  }
  const textCase = own<string | null>(
    look.textCase,
    style.textCase,
    AS_TYPED_CASE,
  )
  return [
    ...EMPHASES.filter((emphasis) => look[emphasis] && !style[emphasis]).map(
      (emphasis) => schema.marks[emphasis].create(),
    ),
    ...(Object.values(textStyleAttributes).some((value) => value !== null)
      ? [schema.marks.textStyle.create(textStyleAttributes)]
      : []),
    ...(textCase === null ? [] : [schema.marks.textCase.create({ textCase })]),
  ]
}

/**
 * In the selection's blocks of this style, keeps every bit of text looking as
 * it did, now relative to the style's new look: what the style gives anyway
 * stops being the text's own (so it follows the style from here on), and what
 * still differs (a word kept plain) stays its own.
 */
function keepLookUnderNewStyle(
  editor: Editor,
  { isTitle }: TextStyleContext,
  name: TextStyleName,
  oldStyle: TextStyleSettings,
  newStyle: TextStyleSettings,
  editorFont: FontValue,
) {
  const { state } = editor
  const { $from, $to } = state.selection
  const { tr, schema } = state
  state.doc.nodesBetween($from.start(), $to.end(), (block, position) => {
    if (!block.isTextblock) return true
    const blockStyleName = isTitle ? 'title' : getBlockTextStyleName(block)
    if (blockStyleName !== name) return false
    block.forEach((child, offset) => {
      // Code keeps its own look; it takes no other marks.
      if (!child.isText || child.marks.some(({ type }) => type.name === 'code'))
        return
      const from = position + 1 + offset
      const to = from + child.nodeSize
      const textStyleMark = child.marks.find(
        ({ type }) => type.name === 'textStyle',
      )
      // Attributes this module doesn't set (e.g. a later feature's) are kept as they are.
      const nextMarks = marksForLook(
        readLook(child.marks, oldStyle),
        newStyle,
        schema,
        editorFont,
        textStyleMark?.attrs ?? {},
      )
      for (const mark of child.marks.filter(isLookMark))
        tr.removeMark(from, to, mark)
      for (const mark of nextMarks) tr.addMark(from, to, mark)
    })
    return false
  })
  if (tr.docChanged) editor.view.dispatch(tr)
}

/**
 * Makes a text style look like the selected text (or the text at the cursor),
 * as the toolbar shows it: everything but size. The text in the selection's
 * blocks of that style keeps its look, now mostly following the style.
 */
export function matchTextStyle(
  editor: Editor,
  context: TextStyleContext,
  editorFont: FontValue,
  name: TextStyleName,
  changeTextStyle: (name: TextStyleName, look: TextStyleLook) => void,
) {
  const look = readShownLook(editor, context)
  const oldStyle = context.textStyles[name]
  changeTextStyle(name, look)
  keepLookUnderNewStyle(
    editor,
    context,
    name,
    oldStyle,
    { ...oldStyle, ...look },
    editorFont,
  )
}
