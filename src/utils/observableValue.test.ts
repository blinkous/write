import { createObservableValue } from './observableValue'

describe('createObservableValue', () => {
  it('tells subscribers about changes, not repeats, until they unsubscribe', () => {
    const observable = createObservableValue(1)
    const listener = vi.fn()
    const unsubscribe = observable.subscribe(listener)
    observable.set(2)
    observable.set(2)
    expect(observable.get()).toBe(2)
    expect(listener).toHaveBeenCalledOnce()
    unsubscribe()
    observable.set(3)
    expect(listener).toHaveBeenCalledOnce()
  })
})
