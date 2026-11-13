import type { ReactNode } from 'react'
import type { TextStyleName } from './textStyleSettings'
import styles from './TextStylePreview.module.css'

type TextStylePreviewProps = {
  name: TextStyleName
  children: ReactNode
}

/** Text drawn in a text style (e.g. a style's name in a menu), at its size relative to body. */
export function TextStylePreview({ name, children }: TextStylePreviewProps) {
  return <span className={styles[name]}>{children}</span>
}
