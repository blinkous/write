import type { JSONContent } from '@tiptap/react'
import { titleExtensions } from '../../journal-document'
import { createTestEditor } from '../../test/createTestEditor'
import {
  createJournalEntry,
  getTitleDocument,
  readTitleDocument,
  reconcileTitleContent,
  renameEntryTitle,
  summarizeEntry,
} from './journalEntry'
import { TitleBehavior } from './titleBehavior'

const titleDocument = (...content: JSONContent[]): JSONContent => ({
  type: 'doc',
  content: [{ type: 'paragraph', content }],
})
const plain = (text: string) => titleDocument({ type: 'text', text })
const bold = (text: string) =>
  titleDocument({ type: 'text', text, marks: [{ type: 'bold' }] })

describe('title documents', () => {
  it('stores a plain title as text only, trimmed', () => {
    expect(readTitleDocument(plain(' Rainy Sunday '))).toEqual({
      title: 'Rainy Sunday',
      titleContent: null,
    })
  })

  it('keeps the styling of a styled title', () => {
    expect(readTitleDocument(bold('Sunday'))).toEqual({
      title: 'Sunday',
      titleContent: bold('Sunday'),
    })
  })

  it('keeps a plain title’s alignment, and stays text only without one', () => {
    const aligned = (alignment: string | null): JSONContent => ({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { alignment },
          content: [{ type: 'text', text: 'Sunday' }],
        },
      ],
    })
    expect(readTitleDocument(aligned('center'))).toEqual({
      title: 'Sunday',
      titleContent: aligned('center'),
    })
    expect(readTitleDocument(aligned(null)).titleContent).toBeNull()
  })

  it('stores nothing for a blank title, so the first line names the entry', () => {
    expect(readTitleDocument(titleDocument())).toEqual({
      title: null,
      titleContent: null,
    })
  })

  it('shows a plain title as a title document', () => {
    expect(
      getTitleDocument({ ...createJournalEntry(), title: 'Sunday' }),
    ).toEqual(plain('Sunday'))
  })

  it('drops stored styling that is invalid or no longer matches the title', () => {
    // Validation fills in defaults (e.g. no alignment of its own), so compare content.
    expect(reconcileTitleContent('Sunday', bold('Sunday'))).toMatchObject(
      bold('Sunday'),
    )
    expect(reconcileTitleContent('Monday', bold('Sunday'))).toBeNull()
    expect(
      reconcileTitleContent('Sunday', {
        type: 'doc',
        content: [{ type: 'heading' }],
      }),
    ).toBeNull()
  })

  it('keeps styling through a sidebar rename only if the text is unchanged', () => {
    const entry = {
      ...summarizeEntry(createJournalEntry()),
      title: 'Sunday',
      titleContent: bold('Sunday'),
    }
    expect(renameEntryTitle(entry, 'Sunday ')).toEqual({
      title: 'Sunday',
      titleContent: bold('Sunday'),
    })
    expect(renameEntryTitle(entry, 'Monday')).toEqual({
      title: 'Monday',
      titleContent: null,
    })
  })
})

describe('TitleBehavior', () => {
  function createTitleEditor(content: string, onContinue = vi.fn()) {
    const editor = createTestEditor({
      extensions: [
        ...titleExtensions,
        TitleBehavior.configure({ maxLength: 10 }),
      ],
      content,
    })
    editor.commands.setContinueHandler(onContinue)
    return { editor, onContinue }
  }

  it('moves on to the writing on Enter instead of adding a line', () => {
    const { editor, onContinue } = createTitleEditor('<p>Title</p>')
    editor.commands.focus('end')
    editor.commands.keyboardShortcut('Enter')
    expect(onContinue).toHaveBeenCalledOnce()
    expect(editor.getJSON().content).toHaveLength(1)
  })

  it('stops at the length limit', () => {
    const { editor } = createTitleEditor('<p>0123456789</p>')
    editor.commands.insertContentAt(editor.state.doc.content.size - 1, 'x')
    expect(editor.getText()).toBe('0123456789')
  })

  it('keeps pasted blocks to one line', () => {
    const { editor } = createTitleEditor('<p>a</p><p>b</p>')
    expect(editor.getJSON().content).toHaveLength(1)
  })
})
