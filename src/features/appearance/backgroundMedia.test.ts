import {
  BACKGROUND_MEDIA_MAX_MEGABYTES,
  checkBackgroundFile,
} from './backgroundMedia'

const MEGABYTE = 1024 * 1024

describe('checkBackgroundFile', () => {
  it.each([
    ['image/jpeg', 'image'],
    ['image/gif', 'image'],
    ['video/mp4', 'video'],
    ['video/webm', 'video'],
  ])('takes %s as a background %s', (type, kind) => {
    expect(checkBackgroundFile({ type, size: MEGABYTE })).toEqual({
      isUsable: true,
      kind,
    })
  })

  it.each(['application/pdf', 'audio/mpeg', ''])('turns down %j', (type) => {
    expect(checkBackgroundFile({ type, size: MEGABYTE })).toMatchObject({
      isUsable: false,
    })
  })

  it('takes files up to the size limit, not past it', () => {
    const limit = BACKGROUND_MEDIA_MAX_MEGABYTES * MEGABYTE
    expect(
      checkBackgroundFile({ type: 'video/mp4', size: limit }).isUsable,
    ).toBe(true)
    expect(
      checkBackgroundFile({ type: 'video/mp4', size: limit + 1 }).isUsable,
    ).toBe(false)
  })
})
