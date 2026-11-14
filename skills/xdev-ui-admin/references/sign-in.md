# Sign-in

`AuthShell`: a showcase side next to a form pane. Use it for sign-in, sign-up and password reset; the pages after sign-in use `AppShell`.

From 1024px the showcase takes five eighths of the width: the art centred, the headline and tagline centred under it, the footer (copyright, two links) at its foot. The form pane takes the rest: brand at the top start, language and theme at the top end, the form centred, at most 26rem wide.

```tsx
<AuthShell
  brand={<><BrandMark variant="tile" size={32} /><span>{t("app.name")}</span></>}
  actions={<><Select icon="globe" aria-label={t("lang.label")} value={lang} onChange={onLang} options={LANGS} /><ThemeSwitch variant="icon" value={theme} onChange={onTheme} /></>}
  headline={t("signin.headline")}
  tagline={t("signin.tagline")}
  footer={t("signin.footer")}
>
  <Stack gap={4}>
    <Stack gap={1}>
      <h1>{t("signin.welcome")}</h1>
      <p className="muted">{t("signin.purpose")}</p>
    </Stack>
    {error ? <Banner tone="danger" title={t("signin.failed")}>{error}</Banner> : null}
    <form onSubmit={onSubmit}>
      <Stack gap={3}>
        <Field label={t("signin.email")} type="email" autoComplete="username" required />
        <Field label={t("signin.password")} type="password" autoComplete="current-password" required />
        <Button variant="primary" type="submit" disabled={busy}>{t("signin.submit")}</Button>
      </Stack>
    </form>
  </Stack>
</AuthShell>
```

- One `h1` in the form ("Welcome back", "Sign in") with one muted line under it on what the account is for; the headline is the product line, not the page title. No emoji.
- `actions` holds the language `Select` and the theme `ThemeSwitch` (icon); both, so a person can fix either before signing in.
- One primary `Button`, full width. A second way in (single sign-on, a token) is a secondary `Button` or a second `Card`, with a short line on when to use it.
- A wrong password or an expired link shows a `Banner` above the form, in words that say what to do; never clear what the person typed.
- Disable the submit button while the request runs; focus the first field on load.
- Headline and tagline are two short translated lines that say what the product does. No marketing paragraph.
- Art is the product's own picture (a diagram of what it does) or the built-in pattern; never a stock illustration from another product.
- Check it at 375px (only the form pane shows) and at 1440px, in dark and light.
