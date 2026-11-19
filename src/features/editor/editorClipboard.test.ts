import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'
import { editorExtensions } from './editorExtensions'
import { getSelectionClipboard } from './editorClipboard'
import { createTestEditor } from '../../test/createTestEditor'

/** Document position where the first text node holding `word` has it. */
function findWord(document: ProseMirrorNode, word: string): number {
  let position = -1
  document.descendants((node, nodePosition) => {
    const offset = node.text?.indexOf(word) ?? -1
    if (position === -1 && offset !== -1) position = nodePosition + offset
  })
  if (position === -1) throw new Error(`"${word}" isn't in the document`)
  return position
}

/** Markdown for a selection from the start of `firstWord` to the end of `lastWord`. */
function selectedMarkdown(html: string, firstWord: string, lastWord: string) {
  const editor = createTestEditor({
    extensions: editorExtensions,
    content: html,
  })
  const { state, view } = editor
  const from = findWord(state.doc, firstWord)
  const to = findWord(state.doc, lastWord) + lastWord.length
  view.dispatch(
    state.tr.setSelection(TextSelection.create(state.doc, from, to)),
  )
  return getSelectionClipboard(editor)?.text
}

describe('getSelectionClipboard', () => {
  it('keeps inline formatting from part of a paragraph', () => {
    expect(
      selectedMarkdown('<p>A <strong>good</strong> day.</p>', 'A', 'good'),
    ).toBe('A **good**')
  })

  it("doesn't make a heading out of a few of its words", () => {
    expect(selectedMarkdown('<h2>Rainy morning</h2>', 'Rainy', 'Rainy')).toBe(
      'Rainy',
    )
  })

  it('keeps a whole heading a heading', () => {
    expect(selectedMarkdown('<h2>Rainy morning</h2>', 'Rainy', 'morning')).toBe(
      '## Rainy morning',
    )
  })

  it('copies part of a code block as typed', () => {
    expect(
      selectedMarkdown('<pre><code>let x = 1</code></pre>', 'let', 'x'),
    ).toBe('let x')
  })

  it('keeps block markdown across blocks', () => {
    expect(
      selectedMarkdown(
        '<h2>Today</h2><ul><li><p>tea</p></li><li><p>toast</p></li></ul>',
        'Today',
        'toast',
      ),
    ).toBe('## Today\n\n- tea\n- toast')
  })

  it('is null with nothing selected', () => {
    const editor = createTestEditor({
      extensions: editorExtensions,
      content: '<p>Quiet</p>',
    })
    expect(getSelectionClipboard(editor)).toBeNull()
  })

  it('also copies the selection as HTML, so pasting it keeps its formatting', () => {
    const editor = createTestEditor({
      extensions: editorExtensions,
      content: '<p>A <strong>good</strong> day.</p>',
    })
    editor.commands.selectAll()
    expect(getSelectionClipboard(editor)).toEqual({
      text: 'A **good** day.',
      html: '<p>A <strong>good</strong> day.</p>',
    })
  })
})
