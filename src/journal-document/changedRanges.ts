import type { Transaction } from '@tiptap/pm/state'
import { AddMarkStep, RemoveMarkStep } from '@tiptap/pm/transform'

/** Where a transaction changed the document (text, or marks), in the new document. */
export function getChangedRanges(transaction: Transaction): [number, number][] {
  const ranges: [number, number][] = []
  transaction.steps.forEach((step, index) => {
    const laterMapping = transaction.mapping.slice(index + 1)
    const addRange = (from: number, to: number) =>
      ranges.push([laterMapping.map(from, -1), laterMapping.map(to, 1)])
    step.getMap().forEach((_oldFrom, _oldTo, from, to) => addRange(from, to))
    // Mark changes move nothing, so their map is empty.
    if (step instanceof AddMarkStep || step instanceof RemoveMarkStep)
      addRange(step.from, step.to)
  })
  return ranges
}
