import { loadOpenSectionIds, saveOpenSectionIds } from './settingsStorage'

const SECTION_IDS = ['app', 'editor', 'data']

describe('loadOpenSectionIds', () => {
  beforeEach(() => window.localStorage.clear())

  it('starts with every section folded', () => {
    expect(loadOpenSectionIds(SECTION_IDS)).toEqual([])
  })

  it('keeps the sections that were open before folded ones were remembered instead', () => {
    window.localStorage.setItem(
      'write.settingsClosedSections.v1',
      JSON.stringify(['editor']),
    )
    expect(loadOpenSectionIds(SECTION_IDS)).toEqual(['app', 'data'])
  })

  it('reads back the open sections once saved, so new sections start folded', () => {
    window.localStorage.setItem(
      'write.settingsClosedSections.v1',
      JSON.stringify(['editor']),
    )
    saveOpenSectionIds(['data'])
    expect(loadOpenSectionIds([...SECTION_IDS, 'new'])).toEqual(['data'])
  })
})
