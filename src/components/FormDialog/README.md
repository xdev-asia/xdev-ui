# FormDialog

Modal dialog that holds a short form (create or rename one thing), with Cancel, a submit button that shows saving, and a place for the server's error.

## Anatomy
`div.dialog-backdrop[data-modal]` > `form.dialog.x-form-dialog[role=dialog]` > `h2.dialog-title` + `p.x-form-dialog-desc` + `div.dialog-body` (fields) + `p.x-form-dialog-error[role=alert]` + `div.dialog-actions` (Cancel, submit).

## Rules
- For up to about five fields. More fields, or fields the user compares with the page, go in a `Drawer` or a page of their own.
- Title names the action and the object ("New user", "Rename banner"); `submitLabel` repeats the verb ("Create user").
- It is a real `<form>`: Enter in a field submits. `onSubmit` gets the event with navigation already prevented.
- Validate on submit and show each field's message on its `Field` (`error`); put only errors that belong to no field (a conflict, a network failure) in `error`.
- While `busy` both buttons are disabled, the submit button says `labels.saving`, and Esc, Cancel and the backdrop do nothing.
- Close it (unmount) only after the save succeeded, then confirm with a `Toast`.
- Mount it to open it; focus, Tab trap and `inert` work as in `Dialog`.
