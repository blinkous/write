import { useState } from 'react'
import {
  Button,
  Checkbox,
  ChoiceFieldset,
  Dialog,
  RadioGroup,
} from '../../design-system'
import {
  canExport,
  canIncludeSettings,
  getExportContents,
  loadExportChoices,
  saveExportChoices,
  type ExportChoices,
  type ExportFormat,
} from './exportChoices'
import styles from './ExportDialog.module.css'

type ExportDialogProps = {
  isOpen: boolean
  onClose: () => void
  /** The journal as JSON, with the settings in the same file when `includesSettings`. */
  onExportJournal: (options: { includesSettings: boolean }) => void
  onExportMarkdown: () => void
  onExportSettings: () => void
}

const FORMAT_CHOICES: readonly { value: ExportFormat; label: string }[] = [
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
]

/**
 * One place to export: pick the journal and/or settings, and the format.
 * JSON holds either or both in one file (a full backup, imported in one go);
 * markdown holds only the journal. The choices are remembered.
 */
export function ExportDialog({
  isOpen,
  onClose,
  onExportJournal,
  onExportMarkdown,
  onExportSettings,
}: ExportDialogProps) {
  const [choices, setChoices] = useState(loadExportChoices)
  const { includesJournal, includesSettings, format } = choices
  const settingsAllowed = canIncludeSettings(format)

  function changeChoices(changes: Partial<ExportChoices>) {
    const nextChoices = { ...choices, ...changes }
    setChoices(nextChoices)
    saveExportChoices(nextChoices)
  }

  function exportChoices() {
    const contents = getExportContents(choices)
    onClose()
    if (format === 'markdown') onExportMarkdown()
    else if (contents.includesJournal)
      onExportJournal({ includesSettings: contents.includesSettings })
    else onExportSettings()
  }

  return (
    <Dialog
      isOpen={isOpen}
      title="Export"
      onClose={onClose}
      actions={
        <>
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="subtle"
            disabled={!canExport(choices)}
            onClick={exportChoices}
          >
            Export
          </Button>
        </>
      }
    >
      <div className={styles.columns}>
        <ChoiceFieldset
          legend="Include"
          hint={settingsAllowed ? undefined : 'Settings export as JSON only.'}
        >
          <Checkbox
            label="Journal"
            checked={includesJournal}
            onChange={({ target }) =>
              changeChoices({ includesJournal: target.checked })
            }
          />
          <Checkbox
            label="Settings"
            checked={includesSettings && settingsAllowed}
            disabled={!settingsAllowed}
            onChange={({ target }) =>
              changeChoices({ includesSettings: target.checked })
            }
          />
        </ChoiceFieldset>
        <RadioGroup
          legend="Format"
          choices={FORMAT_CHOICES}
          value={format}
          onChange={(nextFormat) => changeChoices({ format: nextFormat })}
        />
      </div>
    </Dialog>
  )
}
