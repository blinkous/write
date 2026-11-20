import '@testing-library/jest-dom/vitest'

// Tests that don't need a DOM can run in Node (`@vitest-environment node`), so
// DOM stand-ins are added only where there's a DOM.
const hasDom = typeof HTMLElement !== 'undefined'

// jsdom lacks the Popover API: popovers open and close as browsers do (a
// popovertarget click toggles them, firing beforetoggle then toggle), minus layout.
if (hasDom && !('showPopover' in HTMLElement.prototype)) {
  const openPopovers = new WeakSet<HTMLElement>()
  function fireToggle(popover: HTMLElement, type: string, newState: string) {
    popover.dispatchEvent(Object.assign(new Event(type), { newState }))
  }
  function setPopoverOpen(popover: HTMLElement, isOpen: boolean) {
    if (openPopovers.has(popover) === isOpen) return
    const newState = isOpen ? 'open' : 'closed'
    fireToggle(popover, 'beforetoggle', newState)
    if (isOpen) openPopovers.add(popover)
    else openPopovers.delete(popover)
    fireToggle(popover, 'toggle', newState)
  }
  Object.defineProperties(HTMLElement.prototype, {
    showPopover: {
      value(this: HTMLElement) {
        setPopoverOpen(this, true)
      },
      configurable: true,
    },
    hidePopover: {
      value(this: HTMLElement) {
        setPopoverOpen(this, false)
      },
      configurable: true,
    },
    togglePopover: {
      value(this: HTMLElement) {
        setPopoverOpen(this, !openPopovers.has(this))
      },
      configurable: true,
    },
  })
  document.addEventListener('click', ({ target }) => {
    const trigger =
      target instanceof Element && target.closest('[popovertarget]')
    const popoverId = trigger && trigger.getAttribute('popovertarget')
    const popover = popoverId && document.getElementById(popoverId)
    if (popover) popover.togglePopover()
  })
}

// jsdom lacks modal dialogs: opening shows the dialog; closing hides it and fires "close", as browsers do.
if (hasDom && !('showModal' in HTMLDialogElement.prototype)) {
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

// jsdom has no layout, so nothing ever resizes: a ResizeObserver that never fires.
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// jsdom lacks IndexedDB; tests that use it start from a fresh, empty one (see resetIndexedDb).
import 'fake-indexeddb/auto'
