import { z } from 'zod'
import { getFontOption, isFontValue, type FontValue } from '../fonts'
import {
  isTextCase,
  LETTER_SPACING_RANGE,
  resolveTextColor,
  resolveTextGlow,
  resolveTextLetterSpacing,
  type TextCase,
} from '../journal-document'
import { pxToRem } from '../utils/units'

/*
 * How each text style looks, set by the person (settings → Editor). The
 * editor, the title and the style menu all draw from the CSS variables these
 * produce, so a change shows everywhere at once.
 */

/** In settings order: the title, headings largest first, then body and small. */
export const TEXT_STYLE_NAMES = [
  'title',
  'heading-2',
  'heading-3',
  'heading-4',
  'heading-5',
  'heading-6',
  'body',
  'small',
] as const
export type TextStyleName = (typeof TEXT_STYLE_NAMES)[number]

export const TEXT_STYLE_LABELS: Record<TextStyleName, string> = {
  title: 'Title',
  'heading-2': 'Heading 2',
  'heading-3': 'Heading 3',
  'heading-4': 'Heading 4',
  'heading-5': 'Heading 5',
  'heading-6': 'Heading 6',
  body: 'Body',
  small: 'Small',
}

/** Sizes in px at normal browser zoom (written as rem, so zoom still works), stepped by 1. */
export const TEXT_STYLE_SIZE_RANGE = { min: 10, max: 48 } as const

/** Letter spacing as a percent of the style's size, the same range as per-text letter spacing. */
export const TEXT_STYLE_LETTER_SPACING_RANGE = LETTER_SPACING_RANGE

export type TextStyleSettings = {
  /** px, within TEXT_STYLE_SIZE_RANGE. */
  size: number
  bold: boolean
  italic: boolean
  underline: boolean
  strike: boolean
  /** Percent of the size, within TEXT_STYLE_LETTER_SPACING_RANGE; 0 is the font's own. */
  letterSpacing: number
  /** How its letters display (UPPER, lower, Title, Sentence), or null for as typed. */
  textCase: TextCase | null
  /** Its own font, or null for the editor font. */
  font: FontValue | null
  /** Its own color (a theme color name or #rrggbb), or null for the page text color. */
  color: string | null
  /** A glow behind the letters in this color (a theme color name or #rrggbb), or null for none. */
  glow: string | null
}

export type TextStyles = Record<TextStyleName, TextStyleSettings>

function style(size: number, bold: boolean): TextStyleSettings {
  return {
    size,
    bold,
    italic: false,
    underline: false,
    strike: false,
    letterSpacing: 0,
    textCase: null,
    font: null,
    color: null,
    glow: null,
  }
}

/** The look before any edits. Must match the --text-style-* defaults in tokens.css (tested). */
export const DEFAULT_TEXT_STYLES: TextStyles = {
  title: style(28, true),
  'heading-2': style(24, true),
  'heading-3': style(21, true),
  'heading-4': style(18, true),
  'heading-5': style(17, true),
  'heading-6': style(16, true),
  body: style(16, false),
  small: style(14, false),
}

/** A text color or glow: a theme color name or #rrggbb, or null; anything else reads as null. */
const optionalTextColorSchema = z
  .string()
  .refine((color) => resolveTextColor(color) !== null)
  .nullable()
  .catch(null)

/* Each setting falls back on its own, so one bad value resets only itself. */
function createStyleSchema(name: TextStyleName) {
  const defaults = DEFAULT_TEXT_STYLES[name]
  return z
    .object({
      size: z
        .number()
        .int()
        .min(TEXT_STYLE_SIZE_RANGE.min)
        .max(TEXT_STYLE_SIZE_RANGE.max)
        .catch(defaults.size),
      bold: z.boolean().catch(defaults.bold),
      italic: z.boolean().catch(defaults.italic),
      underline: z.boolean().catch(defaults.underline),
      strike: z.boolean().catch(defaults.strike),
      letterSpacing: z
        .number()
        .int()
        .min(TEXT_STYLE_LETTER_SPACING_RANGE.min)
        .max(TEXT_STYLE_LETTER_SPACING_RANGE.max)
        .catch(defaults.letterSpacing),
      textCase: z.custom<TextCase>(isTextCase).nullable().catch(null),
      font: z.custom<FontValue>(isFontValue).nullable().catch(null),
      color: optionalTextColorSchema,
      glow: optionalTextColorSchema,
    })
    .catch(defaults)
}

/** Stored text styles; anything missing or unreadable gets its default. */
export const textStylesSchema = z
  .object({
    title: createStyleSchema('title'),
    'heading-2': createStyleSchema('heading-2'),
    'heading-3': createStyleSchema('heading-3'),
    'heading-4': createStyleSchema('heading-4'),
    'heading-5': createStyleSchema('heading-5'),
    'heading-6': createStyleSchema('heading-6'),
    body: createStyleSchema('body'),
    small: createStyleSchema('small'),
  })
  .catch(DEFAULT_TEXT_STYLES)

/*
 * CSS can only do UPPER and lower; title and sentence case display lowercase
 * and the editor capitalizes letters itself (journal-document's textCase).
 * Previews show a style's name, which is already in title case, so CSS's
 * `capitalize` is enough there.
 */
const CASE_TRANSFORMS: Record<
  TextCase | 'as-typed',
  { text: string; preview: string }
> = {
  upper: { text: 'uppercase', preview: 'uppercase' },
  lower: { text: 'lowercase', preview: 'lowercase' },
  title: { text: 'lowercase', preview: 'capitalize' },
  sentence: { text: 'lowercase', preview: 'none' },
  'as-typed': { text: 'none', preview: 'none' },
}

function getTextDecoration(underline: boolean, strike: boolean): string {
  const lines = [underline && 'underline', strike && 'line-through'].filter(
    Boolean,
  )
  return lines.length > 0 ? lines.join(' ') : 'none'
}

/**
 * The CSS variables for every style: size (rem), scale (relative to body, for
 * previews at another size), weight, style (italic), decoration (underline,
 * strikethrough), letter spacing, case (text-transform, and one for previews),
 * font, color and glow (a text-shadow). Defaults resolve to the editor font and the
 * page text color.
 */
export function getTextStyleVariables(
  textStyles: TextStyles,
): Record<string, string> {
  const bodySize = textStyles.body.size
  return Object.fromEntries(
    TEXT_STYLE_NAMES.flatMap((name) => {
      const {
        size,
        bold,
        italic,
        underline,
        strike,
        letterSpacing,
        textCase,
        font,
        color,
        glow,
      } = textStyles[name]
      const caseTransforms = CASE_TRANSFORMS[textCase ?? 'as-typed']
      const prefix = `--text-style-${name}`
      return [
        [`${prefix}-size`, pxToRem(size)],
        [`${prefix}-scale`, `${size / bodySize}`],
        [
          `${prefix}-weight`,
          bold ? 'var(--font-weight-bold)' : 'var(--font-weight-regular)',
        ],
        [`${prefix}-style`, italic ? 'italic' : 'normal'],
        [`${prefix}-decoration`, getTextDecoration(underline, strike)],
        [
          `${prefix}-letter-spacing`,
          resolveTextLetterSpacing(letterSpacing) ?? '0em',
        ],
        [`${prefix}-transform`, caseTransforms.text],
        [`${prefix}-preview-transform`, caseTransforms.preview],
        [
          `${prefix}-font`,
          font ? getFontOption(font).family : 'var(--font-editor)',
        ],
        [`${prefix}-color`, resolveTextColor(color) ?? 'var(--color-text)'],
        [`${prefix}-glow`, resolveTextGlow(glow) ?? 'none'],
      ]
    }),
  )
}
