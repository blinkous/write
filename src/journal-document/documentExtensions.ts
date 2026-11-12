import StarterKit from '@tiptap/starter-kit'
import './documentDisplay.css'
import { JournalHeading } from './journalHeading'
import { JournalStrike } from './journalStrike'
import { MarkdownSafeParagraph } from './markdownSafeParagraph'
import { ParagraphSize } from './paragraphSize'
import { TextCaseMark } from './textCase'
import { textStyleExtensions } from './textColor'

/**
 * Extensions that define what a journal document can contain. Anything that
 * stores, imports or edits documents must use these so they agree on the schema.
 */
export const documentExtensions = [
  StarterKit.configure({
    link: { openOnClick: false, autolink: true },
    // Replaced below: paragraphs that can't be misread as markdown, and headings
    // that leave level 1 for the entry's title.
    paragraph: false,
    heading: false,
    strike: false,
  }),
  MarkdownSafeParagraph,
  JournalHeading,
  JournalStrike,
  ...textStyleExtensions,
  TextCaseMark,
  ParagraphSize,
]
