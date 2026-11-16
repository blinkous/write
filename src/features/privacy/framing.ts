/*
 * Whether this page is shown inside another page's frame. GitHub Pages can't
 * send the frame-ancestors header (and a <meta> CSP ignores it), so the app
 * checks for itself and refuses to run framed, which stops clickjacking.
 * Comparing window objects is allowed across origins.
 */
export function isFramed(
  currentWindow: Pick<Window, 'self' | 'top'> = window,
): boolean {
  return currentWindow.self !== currentWindow.top
}
