/**
 * Gives `target` the whole of `text` as its tooltip only while `text` is cut
 * short ("…"), so labels that fit don't get one. Call on pointer enter, when
 * the current width is what counts.
 */
export function showFullTextIfCut(target: HTMLElement, text: HTMLElement) {
  const isCut = text.scrollWidth > text.clientWidth
  if (isCut) target.title = text.textContent ?? ''
  else target.removeAttribute('title')
}
