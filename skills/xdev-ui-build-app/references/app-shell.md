# App shell

```tsx
<AppShell
  labels={ui.appShell}
  navOpen={navOpen}
  onNavOpenChange={setNavOpen}
  toasts={toasts}
  brand={<><BrandMark size={20} /><span>{t("app.name")}</span></>}
  nav={<NavList title={t("nav.main")} labels={ui.navList} value={current?.id} onSelect={() => setNavOpen(false)} items={items} />}
  crumbs={<Breadcrumb items={crumbs} labels={ui.breadcrumb} />}
>
  {page}
</AppShell>
```

- Below 768px the sidebar is a drawer: pass `navOpen` and `onNavOpenChange`, and close it in `onSelect`.
- `NavList` items take `icon` (an `IconName`) and `href`; one `NavList` per group, with a short `title`.
- Put the `PageHeader` first in each page; the page has one `h1`.
- Hide a nav item the user may not open; do not show it disabled.
