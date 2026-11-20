import { DEFAULT_APPEARANCE } from '../appearance/appearanceOptions'
import {
  parseSettingsFile,
  parseSettingsRecord,
  serializeSettings,
  toSettingsRecord,
} from './settingsFile'

// Settings files never say which background is showing (its file stays in this browser).
const { backgroundFileId: _backgroundFileId, ...appearance } =
  DEFAULT_APPEARANCE
const settings = {
  appearance: { ...appearance, appFont: 'nunito', margins: 'wide' },
  entrySort: 'name',
  shortcuts: { bold: 'Mod-k', italic: null },
} as const

describe('settings files', () => {
  it('round-trips settings', () => {
    const result = parseSettingsFile(serializeSettings(settings))
    expect(result).toMatchObject({ kind: 'settings', settings })
  })

  it('reads the settings record saved inside a journal export', () => {
    // Saved and read as JSON, like the journal file that carries it.
    const savedRecord = JSON.parse(JSON.stringify(toSettingsRecord(settings)))
    expect(parseSettingsRecord(savedRecord)).toMatchObject({
      kind: 'settings',
      settings,
    })
  })

  it('leaves the current background out, both ways', () => {
    const showing = {
      ...settings,
      appearance: { ...settings.appearance, backgroundFileId: 'abc' },
    }
    const file = JSON.parse(serializeSettings(showing))
    expect(file.appearance).not.toHaveProperty('backgroundFileId')
    file.appearance.backgroundFileId = 'abc'
    const result = parseSettingsFile(JSON.stringify(file))
    expect(
      result.kind === 'settings' && result.settings.appearance,
    ).not.toHaveProperty('backgroundFileId')
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

describe('shortcuts in settings files', () => {
  it('leaves shortcuts as they are when a file has none', () => {
    const file = JSON.parse(serializeSettings(settings))
    delete file.shortcuts
    const result = parseSettingsFile(JSON.stringify(file))
    expect(result.kind === 'settings' && result.settings.shortcuts).toBe(
      undefined,
    )
  })

  it('drops unknown actions and shortcuts that typing would set off', () => {
    const file = JSON.parse(serializeSettings(settings))
    file.shortcuts = { bold: 'b', 'not-an-action': 'Mod-j', italic: 'Mod-j' }
    const result = parseSettingsFile(JSON.stringify(file))
    expect(result.kind === 'settings' && result.settings.shortcuts).toEqual({
      italic: 'Mod-j',
    })
  })
})
