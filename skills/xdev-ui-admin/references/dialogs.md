# Dialogs

Use a modal `Dialog` for create and delete.

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
- A create dialog holds a `Field` per input, a `Select` for the role and a `Checkbox` for options; validate on confirm.
- Host the dialogs once near the app root and open them from any page with a small `{ kind, ... }` state.
- After success: close, reload the list, `notify(t("createUser.created"))`.
