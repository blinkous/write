const TEXT_MIME_TYPE = 'text/plain'
const HTML_MIME_TYPE = 'text/html'

/** Text for plain-text apps, and the same as HTML for apps that take formatting. */
export type RichClipboardContent = { text: string; html: string }

/**
 * Writes each type's contents, which may still be on their way (e.g. read
 * from storage): the clipboard is claimed right away, while the click still
 * counts (Safari allows writes only then), and filled once they arrive.
 * Without ClipboardItem, only the plain text goes. Returns false when the
 * browser denies access or the contents can't be made.
 */
async function writeToClipboard(
  plainText: Promise<string>,
  html?: Promise<string>,
): Promise<boolean> {
  try {
    if (typeof ClipboardItem === 'undefined') {
      await navigator.clipboard.writeText(await plainText)
      return true
    }
    const toBlob = (type: string) => (contents: string) =>
      new Blob([contents], { type })
    await navigator.clipboard.write([
      new ClipboardItem({
        [TEXT_MIME_TYPE]: plainText.then(toBlob(TEXT_MIME_TYPE)),
        ...(html && { [HTML_MIME_TYPE]: html.then(toBlob(HTML_MIME_TYPE)) }),
      }),
    ])
    return true
  } catch {
    return false
  }
}

/** Copies plain text to the clipboard. Returns false if it couldn't. */
export function copyTextToClipboard(
  text: string | Promise<string>,
): Promise<boolean> {
  return writeToClipboard(Promise.resolve(text))
}

/** Copies text with its formatting, as ⌘C does. Returns false if it couldn't. */
export function copyRichTextToClipboard(
  content: RichClipboardContent | Promise<RichClipboardContent>,
): Promise<boolean> {
  const resolved = Promise.resolve(content)
  return writeToClipboard(
    resolved.then(({ text }) => text),
    resolved.then(({ html }) => html),
  )
}
