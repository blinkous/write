import { createObservableValue } from '../utils/observableValue'

/*
 * Whether the app's saves work, across everything that's saved (the writing,
 * settings), so a failure is never silent. Null while every save works;
 * otherwise a number for the current run of failures, new each time saving
 * starts failing again.
 */
const saveFailure = createObservableValue<number | null>(null)
const failingSources = new Set<string>()
let saveFailureCount = 0

/** Records how a save went; `source` names what was saved (e.g. "entries"), so one working save doesn't hide another failing. */
export function reportSaveResult(source: string, isSaved: boolean): void {
  if (isSaved) failingSources.delete(source)
  else failingSources.add(source)
  if (failingSources.size === 0) return saveFailure.set(null)
  if (saveFailure.get() === null) saveFailure.set(++saveFailureCount)
}

/** For useSyncExternalStore: the current run of failed saves, or null while saves work. */
export const getSaveFailure = saveFailure.get
export const subscribeToSaveFailure = saveFailure.subscribe
