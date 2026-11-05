# Users and roles

## Contents
- Users
- Roles matrix

## Users
The users page is the resource list recipe with `Avatar`, `Tag` for the role and `StatusDot` for the status. A user detail page adds `Tabs` (Profile, Activity), a `DescriptionList` and two `FormSection`.

## Roles matrix

A role list on the left (`ListRow` with `selected`), a `DataTable` matrix on the right: one row per resource, one `Checkbox` per action.

```tsx
const columns: DataTableColumn<Resource>[] = [
  { key: "resource", header: t("roles.resource"), cell: (r) => t(`roles.resources.${r}`) },
  ...ACTIONS.map<DataTableColumn<Resource>>((a) => ({
    key: a,
    header: t(`roles.${a}`),
    align: "end",
    cell: (r) => (
      <Checkbox aria-label={`${roleName}: ${t(`roles.resources.${r}`)}, ${t(`roles.${a}`)}`} checked={draft.permissions[r][a]} disabled={!editable} onChange={(e) => onToggle(r, a, e.target.checked)} />
    ),
  })),
];
```

- Every checkbox has an `aria-label` naming role, resource and action.
- Edit a draft copy with a pure `togglePermission(role, resource, action, value)`; compare with `samePermissions` to know if the draft is dirty.
- When dirty, show a `Banner` "Unsaved changes" and enable Discard (secondary) and Save (primary) in the `FormSection` `actions`.
- The owner role is read-only: disable every checkbox and say why in the section description.
- A role that cannot update roles sees the matrix disabled and no actions.
