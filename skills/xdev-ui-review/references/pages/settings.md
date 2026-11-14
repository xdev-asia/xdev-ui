# Page check: settings

**This page is a settings page when** it is made of `SettingRow`s or a `SettingsShell` whose controls change how the account, workspace or app behaves.

Source rules: `xdev-ui-admin/references/settings.md`, `forms.md`, `permissions.md`.

## Auto (audit.mjs)
- `i18n-labels` (with `--i18n`): a `SettingsShell` or `SaveBar` with no `labels`.
- `primary-count`, `label-voice`.

## By hand
- [ ] **Apply at once.** A `Switch`, `Select` or `SegmentedControl` saves when it changes. While the save runs it is disabled. It confirms with a `Toast`. On failure it flips back and shows a `Banner`. A Switch next to a Save button fails this check.
- [ ] **Save only for text.** Text fields are saved with a Save button or a `SaveBar`. It shows only when something changed, and leaving with unsaved text asks first.
- [ ] **Names.** Each row passes `controlId`. The control has that `id` and `aria-describedby="<controlId>-hint"`. Clicking the label moves focus to the control.
- [ ] **Loaded value.** The page reads the stored value before showing the control (a skeleton until then). It never starts from a hard-coded default that a save would overwrite.
- [ ] **Sections in the route.** Each section has its own URL. Reload keeps it, and Back goes to the last section.
- [ ] **Roles.** A person who may not change a setting sees it disabled, with a `Banner` that says who can change it. It is not hidden.
- [ ] **Danger zone.** Destructive settings are last, apart from the rest, and confirm with a destructive dialog (`dialogs-forms.md`).
