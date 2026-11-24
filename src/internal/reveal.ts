/**
 * Ref callback of the active row. Stable, so it fires only when the active row changes and keeps it inside the scrolled
 * list. It scrolls that list only: `scrollIntoView` would also scroll the page, so a palette rendered inline (a docs
 * preview) would pull the page down to it on load.
 */
export function reveal(el: HTMLElement | null): void {
  if (!el) return;
  let box = el.parentElement;
  while (box && box.scrollHeight <= box.clientHeight) box = box.parentElement;
  if (!box || box === document.scrollingElement || box === document.body || box === document.documentElement) return;
  const row = el.getBoundingClientRect();
  const view = box.getBoundingClientRect();
  if (row.top < view.top) box.scrollTop -= view.top - row.top;
  else if (row.bottom > view.bottom) box.scrollTop += row.bottom - view.bottom;
}
