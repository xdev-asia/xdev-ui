# Settings

A `NavList` of sections next to a `FormSection` per section. Each setting is a `SettingRow` with its control on the right.

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
