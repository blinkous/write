const TEXT_MIME_TYPE = 'text/plain'

/**
 * Copies plain text to the clipboard. Returns false when the browser denies
 * access or the text can't be made.
 *
 * The text may still be on its way (e.g. read from storage): the clipboard
 * is claimed right away, while the click still counts (Safari allows writes
 * only then), and filled once the text arrives.
 */
export async function copyTextToClipboard(
  text: string | Promise<string>,
): Promise<boolean> {
  try {
    if (typeof ClipboardItem === 'undefined') {
      await navigator.clipboard.writeText(await text)
      return true
    }
    const blob = Promise.resolve(text).then(
      (resolvedText) => new Blob([resolvedText], { type: TEXT_MIME_TYPE }),
    )
    await navigator.clipboard.write([
      new ClipboardItem({ [TEXT_MIME_TYPE]: blob }),
    ])
    return true
  } catch {
    return false
  }
}
