import { Search } from 'lucide-react'
import styles from './SearchField.module.css'

type SearchFieldProps = {
  /** Accessible name, e.g. "Search entries". */
  label: string
  /** Visible hint; defaults to "Search". */
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

/** A compact search box. Escape clears it. */
export function SearchField({
  label,
  placeholder = 'Search',
  value,
  onChange,
}: SearchFieldProps) {
  return (
    <div className={styles.field}>
      <Search aria-hidden="true" className={styles.icon} />
      <input
        type="search"
        className={styles.input}
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={({ target }) => onChange(target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Escape' || value === '') return
          // Clear first; only a second Escape reaches outer handlers (e.g. closing the sidebar).
          event.stopPropagation()
          onChange('')
        }}
      />
    </div>
  )
}
