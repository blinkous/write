import { getSaveFailure, reportSaveResult } from './saveStatus'

describe('save status', () => {
  afterEach(() => {
    reportSaveResult('entries', true)
    reportSaveResult('settings', true)
  })

  it('numbers each run of failures, until every source saves again', () => {
    expect(getSaveFailure()).toBeNull()
    reportSaveResult('entries', false)
    const firstRun = getSaveFailure()
    expect(firstRun).not.toBeNull()

    reportSaveResult('settings', false)
    reportSaveResult('entries', true)
    expect(getSaveFailure()).toBe(firstRun)

    reportSaveResult('settings', true)
    expect(getSaveFailure()).toBeNull()

    reportSaveResult('settings', false)
    expect(getSaveFailure()).not.toBe(firstRun)
  })
})
