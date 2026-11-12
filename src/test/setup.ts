import '@testing-library/jest-dom/vitest'

// jsdom lacks the Popover API; menus call it to close. Opening isn't simulated.
for (const method of ['showPopover', 'hidePopover', 'togglePopover'] as const) {
  if (!(method in HTMLElement.prototype)) {
    Object.defineProperty(HTMLElement.prototype, method, {
      value: () => {},
      configurable: true,
    })
  }
}
