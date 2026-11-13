import { DEFAULT_APPEARANCE } from '../appearance/appearanceOptions'
import { parseSettingsFile, serializeSettings } from './settingsFile'

const settings = {
  appearance: { ...DEFAULT_APPEARANCE, appFont: 'nunito', margins: 'wide' },
  entrySort: 'name',
} as const

describe('settings files', () => {
  it('round-trips settings', () => {
    const result = parseSettingsFile(serializeSettings(settings))
    expect(result).toMatchObject({ kind: 'settings', settings })
  })

  it('leaves journal backups and other files to the journal import', () => {
    expect(
      parseSettingsFile('{"format":"write-journal","version":2,"entries":[]}'),
    ).toEqual({ kind: 'other' })
    expect(parseSettingsFile('not json')).toEqual({ kind: 'other' })
  })

  it('reads bad values as defaults instead of rejecting the file', () => {
    const file = JSON.parse(serializeSettings(settings))
    file.appearance.appFont = 'comic-sans'
    file.entrySort = 'random'
    const result = parseSettingsFile(JSON.stringify(file))
    expect(
      result.kind === 'settings' && result.settings.appearance?.appFont,
    ).toBe(DEFAULT_APPEARANCE.appFont)
    expect(
      result.kind === 'settings' && result.settings.entrySort,
    ).toBeUndefined()
  })

  it('rejects settings from a newer version', () => {
    const file = JSON.parse(serializeSettings(settings))
    file.version = 99
    expect(parseSettingsFile(JSON.stringify(file))).toMatchObject({
      kind: 'invalid',
    })
  })
})
