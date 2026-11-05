# Detail and edit forms

```tsx
<PageHeader title={user.name} meta={<StatusDot tone="ok" label={t("users.status.active")} />} actions={<Button variant="secondary" onClick={onDelete}>{t("users.delete")}</Button>} />
<Tabs
  label={user.name}
  idPrefix="user-tabs"
  value={tab}
  onChange={(id) => setTab(id as "profile" | "activity")}
  items={[{ id: "profile", label: t("user.profile") }, { id: "activity", label: t("user.activity") }]}
/>
<DescriptionList items={[{ term: t("user.email"), value: user.email, mono: true }]} />
<FormSection title={t("user.profile")} actions={<Button type="submit" disabled={!dirty || saving}>{t("user.save")}</Button>}>
  <Field label={t("user.name")} value={values.name} error={errors.name ? t(errors.name) : undefined} onChange={(e) => change({ name: e.target.value })} />
</FormSection>
```

- Validate in a pure function that returns message keys; show errors through `Field` `error`, which replaces the hint and sets `aria-invalid`.
- Save is disabled until the form is dirty and while saving; Cancel is secondary and comes first.
- After a save, update the page from the response and call `notify(t("user.saved"))`.
- Use `RadioGroup` for a small exclusive choice, `Select` for a long one, `Checkbox` for an option saved with the form. A `Switch` applies at once, so never put one in a form with a Save button.
- A missing item shows an `EmptyState` with a way back; a failed load shows a `Banner` with "Try again".
