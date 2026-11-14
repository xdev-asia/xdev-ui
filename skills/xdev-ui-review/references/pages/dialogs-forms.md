# Page check: dialogs and forms

**This check applies when** a page opens a `Dialog`, `FormDialog` or `Drawer`, or holds a form of `Field`s. Run it with the page's own check.

Source rules: `xdev-ui-admin/references/dialogs.md`, `forms.md`, `states-feedback.md`.

## Auto (audit.mjs)
- `confirm-dialog`: a destructive `Dialog` (`alert` or `tone="danger"`) that is not `modal`, has no `alert`, or has no `busy` or `confirmDisabled`.
- `form-busy`: a `FormDialog` with no `busy`.
- `autocomplete`: a `password`, `email` or `tel` field with no `autoComplete`.
- `i18n-labels` (with `--i18n`): a `Dialog` with no `labels` (or no `confirmLabel` and `cancelLabel`), and a `FormDialog`, `Drawer` or `Toast` with no `labels`.

## By hand
- [ ] **Destructive confirm.** The title names the object ("Delete user Ada?"). The body says what is lost and whether it can be undone. The confirm button repeats the verb ("Delete user"). Focus starts on Cancel.
- [ ] **Locked while sending.** Confirm and submit cannot be pressed twice. Esc and Cancel do not close the dialog in the middle of a request.
- [ ] **Errors stay inside.** A failed request shows a translated message in the dialog (`error` or a `Banner`). The dialog stays open and keeps the values. It is never a raw `String(e)` and never only a toast.
- [ ] **Success names the object.** The dialog closes, and a past-tense `Toast` names the object ("User Ada deleted"). The list shows the change.
- [ ] **Validation.** Each field shows its own message under it, on submit or blur, not while the person types. The first invalid field gets focus.
- [ ] **Submit label** is the verb ("Create user"), not the noun or "OK".
- [ ] **Autofill.** Sign-in password: `current-password`. A new password: `new-password`. An admin filling in someone else's email: `off`.
- [ ] **Keyboard.** Focus moves into the dialog, Tab stays inside, Esc closes, and focus returns to the button that opened it.
- [ ] **No stacked modals.** A dialog never opens a second modal. A `Drawer` with unsaved changes asks before closing (`confirmLeave`).
- [ ] **360px.** Dialogs become bottom sheets with the actions in reach. Long forms scroll inside the dialog, not the page.
