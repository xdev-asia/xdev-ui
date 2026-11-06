# Forms

## Contents
- Pick the container
- Pick the input
- Validation and saving
- Unsaved changes
- Files and images

## Pick the container
| fields | container |
|---|---|
| 1 to 5, quick create or rename | `FormDialog` |
| edit one row while the list stays visible | `Drawer` (footer: Cancel, then the primary) |
| long or multi-section, or linked from elsewhere | a page with `FormSection`s and a `SaveBar` |
| a setting that applies at once | `SettingRow` with a `Switch`, no Save |

```tsx
<FormDialog title={t("users.new")} submitLabel={t("users.create")} busy={saving} error={formError}
  onSubmit={() => save(draft)} onCancel={close} labels={ui.formDialog}>
  <Field label={t("users.email")} type="email" value={draft.email} error={errors.email} onChange={…} />
  <Combobox label={t("users.role")} options={roleOptions} value={draft.role} onChange={…} />
</FormDialog>
```

## Pick the input
| data | component |
|---|---|
| short text, number, email | `Field` (`type`, `hint`, `error`) |
| long plain text | `Textarea` |
| formatted text (articles, descriptions) | `RichTextEditor` from `@xdev-asia/ui/editor` |
| one of 2 to 5, all visible | `RadioGroup` or `Segmented` |
| one of a short fixed list | `Select` |
| one or many of tens to hundreds, typed to filter | `Combobox` (`multiple`, `onCreate` for tags) |
| a record the server searches | `SearchPicker` |
| a date / a period | `DatePicker` / `DateRangePicker` (ISO `YYYY-MM-DD` strings, never `Date`) |
| on/off that applies now | `Switch`; on/off saved with the form: `Checkbox` |
| files | `FileDrop`; one image with crop: `ImageField` from `@xdev-asia/ui/image` |

## Validation and saving
- Validate in a pure function `validateX(draft): Partial<Record<keyof X, string>>` and unit test it. Show each message on its field (`error` replaces the hint); errors that belong to no field (conflict, network) go in the form's `error`.
- Validate on submit, then live for fields that already show an error. Never on the first keystroke.
- Save is disabled while nothing changed and while saving; the button label says what happens ("Saving…").
- After success: close the dialog or drawer (unmount it), refresh the data, `Toast`. On failure keep every value.
- Server errors map to fields when the API says which field; otherwise the form's `error`.

## Unsaved changes
```tsx
const dirty = !shallowEqual(draft, saved);
const { confirmLeave } = useUnsavedGuard(dirty, t("form.leave"));
// router: if (!confirmLeave()) return;  drawer close: if (confirmLeave()) onClose();
<SaveBar dirty={dirty} busy={saving} error={saveError} onSave={save} onDiscard={() => setDraft(saved)} labels={ui.saveBar} />
```
`SaveBar` goes last in the scrolling content and replaces any Save in the page header.

## Files and images
- `FileDrop` checks `accept` and `maxSize`, lists rejected files with the reason and never uploads: the caller uploads and passes `items` with `progress` and `error`.
- `ImageField` takes `aspect={{ ratio: 16 / 9, width: 1600, height: 900 }}` and `onUpload(blob, name) => Promise<url>`; lock the form's submit while `onBusyChange(true)`.
- `RichTextEditor` uploads pasted and dropped images through `onUploadImage`; lock Save while `onUploadingChange(true)`.
