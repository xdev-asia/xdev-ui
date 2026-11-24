/** After a failed submit, move focus to the first field marked invalid, once React has painted the errors. */
export function focusFirstInvalid(root: HTMLElement | null | undefined): void {
  if (!root || typeof window === "undefined") return;
  window.requestAnimationFrame(() => root.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
}
