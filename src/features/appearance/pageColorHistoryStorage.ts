import { z } from 'zod'
import { readStoredValue, writeStoredValue } from '../../lib/localStore'
import { isHexColor } from '../../utils/color'
import {
  EMPTY_PAGE_COLOR_HISTORY,
  PAGE_COLOR_HISTORY_LIMIT,
  type PageColorHistory,
  type PageColors,
} from './pageColorHistory'

const PAGE_COLOR_HISTORY_STORAGE_KEY = 'write.pageColorHistory.v1'

const pageColorsSchema = z.object({
  backgroundColor: z.string().refine(isHexColor),
  textColor: z.string().refine(isHexColor),
})

/* Drops unreadable steps rather than the whole history, and never keeps more than the limit. */
const stepsSchema = z
  .array(z.unknown())
  .catch([])
  .transform((rawSteps) =>
    rawSteps.flatMap((rawStep): PageColors[] => {
      const result = pageColorsSchema.safeParse(rawStep)
      return result.success ? [result.data] : []
    }),
  )

const storedHistorySchema = z.object({
  past: stepsSchema.transform((steps) =>
    steps.slice(-PAGE_COLOR_HISTORY_LIMIT),
  ),
  future: stepsSchema.transform((steps) =>
    steps.slice(0, PAGE_COLOR_HISTORY_LIMIT),
  ),
})

/** Undo/redo steps survive a refresh; an edit in progress doesn't need to. */
export function loadPageColorHistory(): PageColorHistory {
  const { past, future } = readStoredValue(
    PAGE_COLOR_HISTORY_STORAGE_KEY,
    storedHistorySchema,
    {
      past: [],
      future: [],
    },
  )
  return { ...EMPTY_PAGE_COLOR_HISTORY, past, future }
}

export function savePageColorHistory({ past, future }: PageColorHistory): void {
  writeStoredValue(PAGE_COLOR_HISTORY_STORAGE_KEY, { past, future })
}
