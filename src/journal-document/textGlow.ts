import { Extension } from '@tiptap/core'
import { resolveTextColor } from './textColor'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textGlow: {
      /**
       * Gives the selected text (or text about to be typed) a glow in this
       * color (theme name or #rrggbb), or `none` where its style glows.
       */
      setTextGlow: (glow: string) => ReturnType
      /** Removes the text's own glow, so it follows its text style's. */
      unsetTextGlow: () => ReturnType
    }
  }
}

/**
 * The glow's layers, as blur radii in em so the glow scales with the text.
 * Like a neon tube: tight layers stacked close to the letters build a bright,
 * saturated halo, then wider ones spread a soft bloom around them.
 */
const GLOW_BLUR_RADII_EM = [0.02, 0.05, 0.1, 0.18, 0.3, 0.5, 0.8, 1.2] as const

/** Text's own "no glow", where its text style has one. */
export const NO_GLOW = 'none'

/** A glow text can store as its own: a color (theme name or #rrggbb), or none. */
export const isOwnTextGlow = (glow: unknown): glow is string =>
  glow === NO_GLOW || resolveTextColor(glow) !== null

/**
 * The CSS text-shadow for a stored glow color (a theme name or #rrggbb), or
 * null if it isn't one. Shared by per-text glow and text styles' glow.
 */
export function resolveTextGlow(storedGlow: unknown): string | null {
  const glowColor = resolveTextColor(storedGlow)
  if (!glowColor) return null
  return GLOW_BLUR_RADII_EM.map(
    (blurRadius) => `0 0 ${blurRadius}em ${glowColor}`,
  ).join(', ')
}

/**
 * Per-text glow, its own color separate from the text color (white text with
 * a pink glow reads as neon). Stored on the text style mark like colors, as a
 * theme name or #rrggbb, so documents can't carry arbitrary CSS.
 */
export const TextGlow = Extension.create({
  name: 'textGlow',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          glow: {
            default: null,
            parseHTML: (element) => {
              const glow = element.getAttribute('data-glow')
              return isOwnTextGlow(glow) ? glow : null
            },
            renderHTML: ({ glow }) =>
              isOwnTextGlow(glow) ? { 'data-glow': glow } : {},
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setTextGlow:
        (glow) =>
        ({ chain }) =>
          chain().setMark('textStyle', { glow }).run(),
      unsetTextGlow:
        () =>
        ({ chain }) =>
          chain()
            .setMark('textStyle', { glow: null })
            .removeEmptyTextStyle()
            .run(),
    }
  },
})
