import { Node, type JSONContent } from '@tiptap/core'
import { isImageId } from '../journal-images'

export const IMAGE_NODE_NAME = 'image'

/** Where markdown exports keep pictures, beside the markdown file. */
export const MARKDOWN_IMAGE_FOLDER = 'images'

const IMAGE_ID_ATTRIBUTE = 'data-image-id'

/**
 * Whether an animated picture (a GIF) plays: chosen in its ⋯, or null to
 * follow the system (paused when it asks for less motion).
 */
export const IMAGE_PLAYBACKS = ['playing', 'paused'] as const
export type ImagePlayback = (typeof IMAGE_PLAYBACKS)[number]

export function isImagePlayback(value: unknown): value is ImagePlayback {
  return IMAGE_PLAYBACKS.some((playback) => playback === value)
}

const PLAYBACK_ATTRIBUTE = 'data-playback'

export type ImageAttributes = {
  imageId: string
  alt: string
  playback: ImagePlayback | null
}

/* Brackets and backslashes would end or break the description early. */
function escapeAlt(alt: string): string {
  return alt.replace(/[\\[\]]/g, (character) => `\\${character}`)
}

/**
 * A picture on its own line, stored by its content name (see journal-images),
 * never by URL, so it only ever comes from this browser's own storage. Its
 * description (alt) is read in its place. In markdown it links to its file in
 * the export's images folder.
 */
export const JournalImage = Node.create({
  name: IMAGE_NODE_NAME,
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      imageId: {
        default: null,
        parseHTML: (element) => {
          const imageId = element.getAttribute(IMAGE_ID_ATTRIBUTE)
          return isImageId(imageId) ? imageId : null
        },
        renderHTML: ({ imageId }) =>
          isImageId(imageId) ? { [IMAGE_ID_ATTRIBUTE]: imageId } : {},
      },
      alt: {
        default: '',
        parseHTML: (element) => element.getAttribute('alt') ?? '',
        renderHTML: ({ alt }) => ({ alt: typeof alt === 'string' ? alt : '' }),
      },
      playback: {
        default: null,
        parseHTML: (element) => {
          const playback = element.getAttribute(PLAYBACK_ATTRIBUTE)
          return isImagePlayback(playback) ? playback : null
        },
        renderHTML: ({ playback }) =>
          isImagePlayback(playback) ? { [PLAYBACK_ATTRIBUTE]: playback } : {},
      },
    }
  },

  // Only the journal's own pictures: one from the web would need the network.
  parseHTML: () => [{ tag: `img[${IMAGE_ID_ATTRIBUTE}]` }],

  renderHTML: ({ HTMLAttributes }) => ['img', HTMLAttributes],

  // As plain text (e.g. copied into another app), its description.
  renderText: ({ node }) =>
    typeof node.attrs.alt === 'string' ? node.attrs.alt : '',

  renderMarkdown: ({ attrs }) =>
    `![${escapeAlt(typeof attrs?.alt === 'string' ? attrs.alt : '')}](${MARKDOWN_IMAGE_FOLDER}/${String(attrs?.imageId)})`,
})

/** Whether a stored image node is one the journal can show: a valid content name and a text description. */
export function hasValidImageAttributes(attributes: unknown): boolean {
  if (typeof attributes !== 'object' || attributes === null) return false
  return (
    'imageId' in attributes &&
    isImageId(attributes.imageId) &&
    'alt' in attributes &&
    typeof attributes.alt === 'string'
  )
}

/** Every picture a document shows, each once. */
export function collectImageIds(
  content: JSONContent,
  imageIds = new Set<string>(),
): Set<string> {
  if (content.type === IMAGE_NODE_NAME && isImageId(content.attrs?.imageId))
    imageIds.add(content.attrs.imageId)
  for (const child of content.content ?? []) collectImageIds(child, imageIds)
  return imageIds
}
