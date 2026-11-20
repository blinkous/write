import Document from '@tiptap/extension-document'
import StarterKit from '@tiptap/starter-kit'
import { TextAlignmentAttribute } from './textAlignment'
import { TextCaseMark } from './textCase'
import { textStyleExtensions } from './textStyleMark'

/** A title is one line: a single paragraph. */
const TitleDocument = Document.extend({ content: 'paragraph' })

/**
 * What an entry's title can contain: one line of text with the same inline
 * styles as the writing (bold, italic, underline, strike, color, font, glow, case)
 * and alignment,
 * but no blocks, links or code.
 */
export const titleExtensions = [
  StarterKit.configure({
    document: false,
    heading: false,
    blockquote: false,
    bulletList: false,
    orderedList: false,
    listItem: false,
    listKeymap: false,
    codeBlock: false,
    code: false,
    horizontalRule: false,
    hardBreak: false,
    link: false,
    trailingNode: false,
  }),
  TitleDocument,
  ...textStyleExtensions,
  TextCaseMark,
  TextAlignmentAttribute,
]
