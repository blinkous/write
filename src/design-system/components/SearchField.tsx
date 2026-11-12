import { Search, X } from 'lucide-react'
import { useRef } from 'react'
import styles from './SearchField.module.css'

type SearchFieldProps = {
  /** Accessible name, e.g. "Search entries". */
  label: string
  /** Visible hint; defaults to "Search". */
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

/**
 * A compact search box. Escape clears it; while it's focused, a small × clears
 * it and steps out (for pointers; keyboard users have Escape and Tab).
 */
export function SearchField({
  label,
  placeholder = 'Search',
  value,
  onChange,
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className={styles.field}>
      <Search aria-hidden="true" className={styles.icon} />
      <input
        ref={inputRef}
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
      <button
        type="button"
        className={styles.clear}
        aria-label="Clear search"
        title="Clear search"
        tabIndex={-1}
        // Keep focus in the field until the click lands, so the field doesn't close first.
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          onChange('')
          inputRef.current?.blur()
        }}
      >
        <X aria-hidden="true" />
      </button>
    </div>
  )
}
