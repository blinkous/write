import '@testing-library/jest-dom/vitest'

// jsdom lacks the Popover API: popovers open and close as browsers do (a
// popovertarget click toggles them, firing beforetoggle then toggle), minus layout.
if (!('showPopover' in HTMLElement.prototype)) {
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

// jsdom lacks IndexedDB; tests that use it start from a fresh, empty one (see resetIndexedDb).
import 'fake-indexeddb/auto'
