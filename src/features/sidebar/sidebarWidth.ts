import { z } from 'zod'
import {
  readStoredValue,
  removeStoredValue,
  writeStoredValue,
} from '../../lib/localStore'
import { createObservableValue } from '../../utils/observableValue'
import {
  snapTypedToRange,
  stepThroughRange,
  type NumberRange,
} from '../../utils/numberRange'

const STORAGE_KEY = 'write.sidebarWidth.v1'
/** Set on the page while someone has chosen a width; the default lives in tokens.css. */
const CHOSEN_WIDTH_PROPERTY = '--width-sidebar-chosen'

/** In rem, so a chosen width scales with text size like the rest of the layout. */
export const SIDEBAR_WIDTH_RANGE = {
  min: 14,
  max: 28,
  // Arrow keys move a rem; a drag follows the pointer to the pixel (at 16px text).
  step: 1,
  precision: 0.0625,
} as const satisfies NumberRange

function readRootLength(property: string): number {
  const root = document.documentElement
  return Number.parseFloat(getComputedStyle(root).getPropertyValue(property))
}

/** The browser's default when the page's text size can't be read. */
const DEFAULT_REM_IN_PIXELS = 16

function getRemInPixels(): number {
  const { fontSize } = getComputedStyle(document.documentElement)
  return Number.parseFloat(fontSize) || DEFAULT_REM_IN_PIXELS
}

/** The default width (tokens.css), in rem. */
export function getDefaultSidebarWidth(): number {
  return readRootLength('--width-sidebar') || SIDEBAR_WIDTH_RANGE.min
}

/** The widest it can be now: the range's max, or less in a small window (tokens.css). */
export function getSidebarWidthRange(): NumberRange {
  const maxShare = readRootLength('--share-sidebar-max') || 1
  const maxForWindow = (window.innerWidth * maxShare) / getRemInPixels()
  return {
    ...SIDEBAR_WIDTH_RANGE,
    max: Math.max(
      SIDEBAR_WIDTH_RANGE.min,
      Math.min(SIDEBAR_WIDTH_RANGE.max, Math.floor(maxForWindow)),
    ),
  }
}

/** Someone's chosen width in rem, or null for the default. */
const chosenWidth = createObservableValue<number | null>(
  readStoredValue(
    STORAGE_KEY,
    z
      .number()
      .min(SIDEBAR_WIDTH_RANGE.min)
      .max(SIDEBAR_WIDTH_RANGE.max)
      .nullable(),
    null,
  ),
)

function applyChosenWidth(width: number | null) {
  const { style } = document.documentElement
  if (width === null) style.removeProperty(CHOSEN_WIDTH_PROPERTY)
  else style.setProperty(CHOSEN_WIDTH_PROPERTY, `${width}rem`)
}

// Applied from the start and on every change, whether or not the sidebar is open.
applyChosenWidth(chosenWidth.get())
chosenWidth.subscribe(() => applyChosenWidth(chosenWidth.get()))

export const getChosenSidebarWidth = chosenWidth.get
export const subscribeToSidebarWidth = chosenWidth.subscribe

/** The width in effect, in rem. */
export function getSidebarWidth(): number {
  return chosenWidth.get() ?? getDefaultSidebarWidth()
}

/**
 * Sets the width (within the range), or back to the default with null. Saved unless `isSaved` is false, e.g. mid-drag.
 */
export function setSidebarWidth(
  width: number | null,
  { isSaved = true } = {},
): void {
  const snapped =
    width === null ? null : snapTypedToRange(width, getSidebarWidthRange())
  chosenWidth.set(snapped === getDefaultSidebarWidth() ? null : snapped)
  if (!isSaved) return
  const saved = chosenWidth.get()
  if (saved === null) removeStoredValue(STORAGE_KEY)
  else writeStoredValue(STORAGE_KEY, saved)
}

/** Saves the width in effect (after a drag). */
export function saveSidebarWidth(): void {
  setSidebarWidth(chosenWidth.get())
}

export function resetSidebarWidth(): void {
  setSidebarWidth(null)
}

/** One step wider (1) or narrower (-1). */
export function stepSidebarWidth(direction: 1 | -1): void {
  setSidebarWidth(
    stepThroughRange(getSidebarWidth(), direction, getSidebarWidthRange()),
  )
}

/** The width a drag reaches: where it started, moved by the pointer's travel. */
export function getDraggedWidth(
  startWidth: number,
  pointerTravelInPixels: number,
): number {
  return startWidth + pointerTravelInPixels / getRemInPixels()
}
