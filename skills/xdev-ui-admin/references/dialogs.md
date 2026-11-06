# Dialogs and drawers

| need | use |
|---|---|
| confirm a destructive action | `Dialog` with `alert` |
| create or rename, up to about five fields | `FormDialog` |
| edit or inspect one row, list stays in view | `Drawer` (`size="wide"` for more room) |
| long or multi-step form | its own page |

A destructive confirmation:

```tsx
<Dialog
  modal
  alert
  title={t("deleteUsers.title", { name })}
  confirmLabel={t("users.delete")}
  confirmDisabled={busy}
  onConfirm={onConfirm}
  onCancel={onCancel}
>
  {t("deleteUsers.body")}
</Dialog>
```

- `modal` blocks the page, closes on Escape and returns focus to the control that opened it.
- A destructive confirmation names the thing: "Delete user Ada Lovelace?". Its confirm button is the primary one; Cancel is secondary and first.
- Disable confirm while the request runs (`confirmDisabled`) and show errors inside the dialog, not in a toast.
- A create dialog is a `FormDialog`: a real `<form>`, Enter submits, `busy` locks Esc, Cancel and the backdrop. Field errors on the `Field`s, others in `error`.
- A `Drawer` has `footer` (Cancel, then the primary). Ask before closing it with unsaved changes: `if (confirmLeave()) onClose()`.
- Overlays open by mounting and close by unmounting; focus and `inert` are handled. Never stack more than one modal over another (an `ImageCropper` inside a `FormDialog` is the exception the components support).
- Host the dialogs once near the app root and open them from any page with a small `{ kind, ... }` state.
- After success: close, reload the list, `notify(t("createUser.created"))`.
