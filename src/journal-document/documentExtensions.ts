import StarterKit from '@tiptap/starter-kit'
import { TextCaseMark } from './textCase'
import { textColorExtensions } from './textColor'

/**
 * Extensions that define what a journal document can contain. Anything that
 * stores, imports or edits documents must use these so they agree on the schema.
 */
export const documentExtensions = [
  StarterKit.configure({
    link: { openOnClick: false, autolink: true },
  }),
  ...textColorExtensions,
  TextCaseMark,
]
