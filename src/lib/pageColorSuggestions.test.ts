import { oklch } from 'culori'
import {
  suggestBackgroundColors,
  suggestTextColors,
} from './pageColorSuggestions'

const lightnessOf = (color: string) => oklch(color)?.l ?? 0
const chromaOf = (color: string) => oklch(color)?.c ?? 0

const PAGES = {
  oat: '#ede3d6',
  cocoa: '#2b211c',
  burgundy: '#6e2340',
  white: '#ffffff',
  black: '#000000',
  grey: '#808080',
}

const TEXT_COLORS = {
  red: '#ec3a62',
  pink: '#de7aa0',
  cream: '#f3ead8',
  ink: '#2a2420',
  white: '#ffffff',
  black: '#000000',
}

const isOrdered = (values: number[], direction: 'up' | 'down') =>
  values.every(
    (value, index) =>
      index === 0 ||
      (direction === 'up'
        ? value > values[index - 1]
        : value < values[index - 1]),
  )

describe('suggestBackgroundColors', () => {
  it.each(Object.entries(TEXT_COLORS))(
    'fills a row of distinct pages for %s, as a gradient',
    (_name, textColor) => {
      const suggestions = suggestBackgroundColors(textColor, 'darker', 7)
      expect(suggestions.length).toBeGreaterThanOrEqual(5)
      expect(new Set(suggestions).size).toBe(suggestions.length)
      expect(isOrdered(suggestions.map(lightnessOf), 'up')).toBe(true)
    },
  )

  it('offers faint pages as well as deep ones for a mid red, preferred side first', () => {
    const red = TEXT_COLORS.red
    const darkFirst = suggestBackgroundColors(red, 'darker', 7)
    const lightFirst = suggestBackgroundColors(red, 'lighter', 7)
    expect(lightnessOf(darkFirst[0])).toBeLessThan(lightnessOf(red))
    expect(lightnessOf(darkFirst.at(-1) ?? red)).toBeGreaterThan(
      lightnessOf(red),
    )
    expect(lightnessOf(lightFirst[0])).toBeGreaterThan(lightnessOf(red))
  })

  it('stays rich for a rich text color, not greyed out, and never neon', () => {
    const chromas = suggestBackgroundColors(TEXT_COLORS.pink, 'darker', 7).map(
      chromaOf,
    )
    // Near-white and near-black pages can't hold much color; the mid-tones can.
    expect(Math.max(...chromas)).toBeGreaterThan(0.1)
    // The no-neon cap, give or take rounding to hex.
    chromas.forEach((chroma) => expect(chroma).toBeLessThan(0.121))
  })

  it('gives the far side the room the preferred side lacks', () => {
    // Near-white text: no lighter page reads against it, so all go darker.
    const suggestions = suggestBackgroundColors(TEXT_COLORS.white, 'lighter', 7)
    expect(suggestions).toHaveLength(7)
    suggestions.forEach((color) =>
      expect(lightnessOf(color)).toBeLessThan(lightnessOf('#ffffff')),
    )
  })
})

describe('suggestTextColors', () => {
  it.each(Object.entries(PAGES))(
    'fills a row of distinct, readable text colors for %s',
    (_name, page) => {
      const suggestions = suggestTextColors(page, 'lighter', 7)
      expect(suggestions.length).toBeGreaterThanOrEqual(5)
      expect(new Set(suggestions).size).toBe(suggestions.length)
      expect(isOrdered(suggestions.map(lightnessOf), 'down')).toBe(true)
      // At least the gentlest gap the text ramp uses; whether it reads is the person's call.
      suggestions.forEach((color) =>
        expect(
          Math.abs(lightnessOf(color) - lightnessOf(page)),
        ).toBeGreaterThanOrEqual(0.2 - 0.005),
      )
    },
  )
})
