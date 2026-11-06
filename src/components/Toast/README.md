# Toast

Short-lived confirmation stacked at the bottom-right in `.ws-toasts`.

## Rules
- One sentence, past tense, saying what happened ("Session archived.").
- At most one action, usually Undo.
- `role="status"`, so screen readers announce it without moving focus.
- Never put errors that need a decision in a toast: use a `Dialog` or `Banner`.
- `labels` (`ToastLabels`: `dismiss`) overrides the English default.
- `tone` (`ok` | `warn` | `danger` | `info`) adds an icon and `data-tone`; `danger` uses `role="alert"`. `description` adds a quieter second line.

## Toaster and toast()

Mount `<Toaster />` once near the root, then call `toast()` from anywhere.

```tsx
const id = toast("Settings saved.", { tone: "ok" });
toast("Push failed.", { tone: "danger", description: "The remote rejected it.", action: { label: "Retry", onClick: retry } });
toast.dismiss(id); // or toast.dismiss() for all
```

- Options: `tone`, `description`, `action` (`{label, onClick}`; choosing it also dismisses), `duration` (ms; default 5000, danger 8000; `Infinity` or `0` keeps it until dismissed), `id` (reusing an id replaces that toast in place).
- `Toaster` props: `position` (`bottom-end` default, `bottom-start`, `bottom-center`, `top-end`, `top-start`, `top-center`), `max` (on screen at once, default 3; the rest wait), `labels` (`ToasterLabels`: `region`, `dismiss`).
- Timers pause while the pointer or keyboard focus is inside the region. The entry animation is off under `prefers-reduced-motion`.
- The store is a module singleton read with `useSyncExternalStore`; the server snapshot is empty, so SSR renders an empty region.
