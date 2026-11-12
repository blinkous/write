/**
 * Opt-out markers for Grammarly and LanguageTool, for any editable field with
 * journal text. Well-behaved assistants honor them; they can't stop a
 * malicious extension.
 */
export const WRITING_ASSISTANT_OPT_OUT = {
  'data-gramm': 'false',
  'data-gramm_editor': 'false',
  'data-enable-grammarly': 'false',
  'data-lt-active': 'false',
}
