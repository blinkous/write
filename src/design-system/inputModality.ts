/*
 * Focus rings show while someone is using the keyboard, however focus got
 * there (Tab, arrows, or the app moving it), and not after a click or tap.
 * Browsers' own guess (:focus-visible) misses focus moved by script, e.g.
 * dialogs' Tab handling in WebKit, so the app tracks the last input itself:
 * base.css rings `:focus` only under `data-input="keyboard"`.
 */

/** Pressed alone, these only start a combination (e.g. ⌘-click). */
const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'OS'])

export type InputModality = 'keyboard' | 'pointer'

function setInputModality(modality: InputModality) {
  document.documentElement.dataset.input = modality
}

/** Starts following the last input. Call once, at startup. */
export function trackInputModality(): void {
  window.addEventListener(
    'keydown',
    ({ key }) => {
      if (!MODIFIER_KEYS.has(key)) setInputModality('keyboard')
    },
    true,
  )
  window.addEventListener(
    'pointerdown',
    () => setInputModality('pointer'),
    true,
  )
}
