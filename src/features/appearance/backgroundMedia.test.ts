import { checkBackgroundFile } from './backgroundMedia'

describe('checkBackgroundFile', () => {
  it.each([
    ['image/jpeg', 'image'],
    ['image/gif', 'image'],
    ['video/mp4', 'video'],
    ['video/webm', 'video'],
  ])('takes %s as a background %s', (type, kind) => {
    expect(checkBackgroundFile({ type })).toEqual({
      isUsable: true,
      kind,
    })
  })

  it.each(['application/pdf', 'audio/mpeg', ''])('turns down %j', (type) => {
    expect(checkBackgroundFile({ type })).toMatchObject({
      isUsable: false,
    })
  })
})
