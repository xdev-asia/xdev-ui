# Settings

A `NavList` of sections next to a `FormSection` per section. Each setting is a `SettingRow` with its control on the right.

On a wide page give each section `layout="aside"`: its heading and description sit in the left third and the fields in a box on the right, so a one-field section does not stretch a name input across 1100px and a one-button section does not take a full-width card. Wide tables (members, history) stay in a full-width `Card` below the aside sections.

```tsx
<FormSection layout="aside" title={t("brand.name")} description={t("brand.nameHint")} actions={<Button disabled={!dirty}>{t("common.save")}</Button>}>
  <Field label={t("brand.displayName")} value={name} onChange={onName} />
</FormSection>
```

```tsx
<NavList title={t("settings.title")} labels={ui.navList} value={section} items={SECTIONS.map((s) => ({ id: s, label: t(`settings.sections.${s}`), href: hrefFor.settings(s) }))} />
<SettingRow id="setting-theme" label={t("settings.theme")} description={t("settings.themeHint")} control={<ThemeSwitch value={theme} onChange={onTheme} labels={ui.themeSwitch} />} />
<SettingRow
  id="setting-twoFactor"
  controlId="switch-twoFactor"
  label={t("settings.twoFactor")}
  description={t("settings.twoFactorHint")}
  control={<Switch id="switch-twoFactor" aria-describedby="switch-twoFactor-hint" checked={on} onChange={(e) => onFlag(e.target.checked)} />}
/>
```

- A `Switch` or `Select` row applies at once. Only a text field, such as the workspace name, gets a Save button.
- Give the control the `controlId` and `aria-describedby="<controlId>-hint"` so the label and hint are linked.
- The route carries the section (`#/settings/security`); an unknown section falls back to the first.
- A role that may not change settings sees disabled controls and a `Banner` that says why.
