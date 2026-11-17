import type { Editor } from '@tiptap/react'
import { isFontValue, type FontValue } from '../../fonts'
import {
  isOwnTextCase,
  isOwnTextGlow,
  resolveTextColor,
  resolveTextLetterSpacing,
  type OwnTextCase,
} from '../../journal-document'

/*
 * The selected text's own formatting (or the text about to be typed), null
 * where it has none and follows its text style. Read by the toolbar's menus
 * and by matching a style to the text.
 */

export function readOwnFont(editor: Editor): FontValue | null {
  const { font } = editor.getAttributes('textStyle')
  return isFontValue(font) ? font : null
}

export function readOwnColor(editor: Editor): string | null {
  const { color } = editor.getAttributes('textStyle')
  return resolveTextColor(color) === null ? null : color
}

/** A color, or `none` (NO_GLOW) where its style glows. */
export function readOwnGlow(editor: Editor): string | null {
  const { glow } = editor.getAttributes('textStyle')
  return isOwnTextGlow(glow) ? glow : null
}

/** A case, or `as-typed` where its style has one. */
export function readOwnTextCase(editor: Editor): OwnTextCase | null {
  const { textCase } = editor.getAttributes('textCase')
  return isOwnTextCase(textCase) ? textCase : null
}

export function readOwnLetterSpacing(editor: Editor): number | null {
  const { letterSpacing } = editor.getAttributes('textStyle')
  return resolveTextLetterSpacing(letterSpacing) === null
    ? null
    : Number(letterSpacing)
}
