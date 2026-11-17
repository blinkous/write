import type { Editor } from '@tiptap/react'
import { DEFAULT_TEXT_STYLES, type TextStyles } from '../../text-styles'
import { createTestEditor } from '../../test/createTestEditor'
import { editorExtensions } from './editorExtensions'
import { matchTextStyle, type TextStyleLook } from './matchTextStyle'
import { getBlockTextStyleName } from './textStyles'

/** Headings 2 start plain here, so matching bold text has something to change. */
const textStyles: TextStyles = {
  ...DEFAULT_TEXT_STYLES,
  'heading-2': { ...DEFAULT_TEXT_STYLES['heading-2'], bold: false },
}

function createEditor(content: string) {
  const editor = createTestEditor({ extensions: editorExtensions, content })
  // As useTextStyleBlocks does in the app.
  editor.commands.setBlockEmphasis((block) => {
    const name = getBlockTextStyleName(block)
    if (!name) return null
    const { bold, italic, underline, strike } = textStyles[name]
    return { bold, italic, underline, strike }
  })
  return editor
}

function match(editor: Editor) {
  let matched: TextStyleLook | undefined
  matchTextStyle(
    editor,
    { isTitle: false, textStyles },
    'lora',
    'heading-2',
    (_name, look) => {
      matched = look
    },
  )
  return matched
}

describe('matchTextStyle', () => {
  it('gives the style the look at the cursor, and keeps the rest of the line as it was', () => {
    const editor = createEditor('<h2>rainy <strong>day</strong></h2>')
    editor.commands.setTextSelection(9)
    expect(match(editor)).toMatchObject({ bold: true, italic: false })
    // "day" now follows the style; "rainy" stays plain by turning the style's bold off.
    expect(editor.getHTML()).toBe(
      '<h2><span data-no-bold="">rainy </span>day</h2><p></p>',
    )
  })

  it("takes the text's own color and glow, which then follow the style", () => {
    const editor = createEditor('<h2>neon</h2>')
    editor.commands.setTextSelection({ from: 1, to: 5 })
    editor.chain().setColor('#ffffff').setTextGlow('theme-3').run()
    expect(match(editor)).toMatchObject({ color: '#ffffff', glow: 'theme-3' })
    expect(editor.getHTML()).toBe('<h2>neon</h2><p></p>')
  })

  it("keeps text in other styles' blocks as it is", () => {
    const editor = createEditor('<h2>title</h2><p><em>body</em></p>')
    editor.commands.setTextSelection({ from: 1, to: 12 })
    match(editor)
    expect(editor.getHTML()).toContain('<p><em>body</em></p>')
  })
})
