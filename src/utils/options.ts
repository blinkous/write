type Option = { readonly value: string }

/** Type guard for "is this one of the option values", built from the option list itself. */
export function createOptionGuard<Options extends readonly Option[]>(
  options: Options,
) {
  return (value: unknown): value is Options[number]['value'] =>
    options.some((option) => option.value === value)
}
