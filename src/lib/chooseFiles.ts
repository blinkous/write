/**
 * Opens the system file picker from code (e.g. a keyboard shortcut) and hands
 * over what's chosen, if anything. Must run from a user action, as the picker
 * requires. Files are read locally, never uploaded.
 */
export function chooseFiles(
  accept: string,
  onFilesChosen: (files: File[]) => void,
): void {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = accept
  input.multiple = true
  input.addEventListener(
    'change',
    () => {
      const files = Array.from(input.files ?? [])
      if (files.length > 0) onFilesChosen(files)
    },
    { once: true },
  )
  input.click()
}
