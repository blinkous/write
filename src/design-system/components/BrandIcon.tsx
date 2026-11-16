import type { SimpleIcon } from 'simple-icons'

type BrandIconProps = {
  /** A brand's mark from simple-icons, e.g. `siGithub`. */
  icon: Pick<SimpleIcon, 'path'>
  className?: string
}

/**
 * A brand's logo (Lucide has no brand icons), drawn in the text color like
 * the other icons. Decorative: the label next to it names the brand.
 */
export function BrandIcon({ icon: { path }, className }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d={path} />
    </svg>
  )
}
