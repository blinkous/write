/**
 * A value outside React that components can follow with useSyncExternalStore:
 * get() reads it, set() changes it and tells subscribers, subscribe() returns
 * an unsubscribe function.
 */
export function createObservableValue<Value>(initialValue: Value) {
  let value = initialValue
  const listeners = new Set<() => void>()
  return {
    get: () => value,
    set(nextValue: Value) {
      if (Object.is(nextValue, value)) return
      value = nextValue
      for (const listener of listeners) listener()
    },
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
