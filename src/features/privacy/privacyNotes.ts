import { Lock, TriangleAlert, WifiOff, type LucideIcon } from 'lucide-react'

/*
 * The author's words, shown in the About dialog and the welcome entry. Edit
 * for grammar only, keeping the voice.
 */

export const WELCOME_TITLE = 'Welcome!'

export const WELCOME_INTRO =
  'This is a simple journaling app. I created this as a quick, cozy, and private place to jot things down. No account, no cloud, just you and the page. Hope you enjoy!'

export const WELCOME_SIGN_OFF = 'Write away!'

/** Where the app's source lives, linked from About. */
export const SOURCE_CODE_URL = 'https://github.com/blinkous/write'

/** How your writing is kept: each note is an icon (in the dialog) and its sentences. */
export const PRIVACY_NOTES: readonly {
  icon: LucideIcon
  lines: readonly string[]
}[] = [
  {
    icon: Lock,
    lines: [
      'All data is stored locally in the browser.',
      'Your data is cleared when you clear browser data; to save, export it.',
      'Browsers may also delete it if you haven’t visited in a while, so export regularly.',
      'You can import saved entries anytime.',
    ],
  },
  { icon: WifiOff, lines: ['Once loaded, this page works offline.'] },
  {
    icon: TriangleAlert,
    lines: [
      'Your browser extensions may read data on all sites.',
      'Disable extensions or use a different profile or a browser without them for a private experience.',
    ],
  },
]
