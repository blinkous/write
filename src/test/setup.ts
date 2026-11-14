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

// jsdom lacks modal dialogs: opening shows the dialog; closing hides it and fires "close", as browsers do.
if (!('showModal' in HTMLDialogElement.prototype)) {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      value(this: HTMLDialogElement) {
        this.open = true
      },
      configurable: true,
    },
    close: {
      value(this: HTMLDialogElement) {
        if (!this.open) return
        this.open = false
        this.dispatchEvent(new Event('close'))
      },
      configurable: true,
    },
  })
}
