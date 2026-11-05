import styles from './ColorSwatch.module.css'

type ColorSwatchProps = {
  backgroundColor: string
  textColor: string
}

/** "Aa" sample of a text color on a background color. Decorative; label it at the call site. */
export function ColorSwatch({ backgroundColor, textColor }: ColorSwatchProps) {
  return (
    <span
      className={styles.swatch}
      style={{ background: backgroundColor, color: textColor }}
      aria-hidden="true"
    >
      Aa
    </span>
  )
}
