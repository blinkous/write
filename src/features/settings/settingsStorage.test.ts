import { loadOpenSectionIds, saveOpenSectionIds } from './settingsStorage'

const SECTION_IDS = ['app', 'editor', 'data']
const DEFAULT_OPEN_SECTION_IDS = ['app']

describe('loadOpenSectionIds', () => {
  beforeEach(() => window.localStorage.clear())

  it('starts with only the default open sections open', () => {
    expect(loadOpenSectionIds(SECTION_IDS, DEFAULT_OPEN_SECTION_IDS)).toEqual([
      'app',
    ])
  })

  it('keeps the sections that were open before folded ones were remembered instead', () => {
    window.localStorage.setItem(
      'write.settingsClosedSections.v1',
      JSON.stringify(['editor']),
    )
    expect(loadOpenSectionIds(SECTION_IDS, DEFAULT_OPEN_SECTION_IDS)).toEqual([
      'app',
      'data',
    ])
  })

  it('reads back the open sections once saved, so new sections start folded', () => {
    window.localStorage.setItem(
      'write.settingsClosedSections.v1',
      JSON.stringify(['editor']),
    )
    saveOpenSectionIds(['data'])
    expect(
      loadOpenSectionIds([...SECTION_IDS, 'new'], DEFAULT_OPEN_SECTION_IDS),
    ).toEqual(['data'])
  })
})
