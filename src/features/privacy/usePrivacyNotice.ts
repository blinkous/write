import { useState } from 'react'

/** The About dialog: closed until opened from the journal menu. */
export function usePrivacyNotice() {
  const [isOpen, setIsOpen] = useState(false)
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }
}
