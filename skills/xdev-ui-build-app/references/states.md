# States

Every page that reads data renders exactly one of these.

| state | part | rule |
|---|---|---|
| loading | `Spinner` size `md` in a pane, or `loading` on `DataTable` and `StatTile` | give it a label from `ui.spinner` |
| error | `Banner` with a `Button` variant `secondary` "Try again" | say what failed and how to retry |
| empty | `EmptyState` with an icon, a title, a hint and at most one primary action | name the search text when filters match nothing |
| saved | `Toast` through a `notify` function | one short sentence: "Item created." |

```tsx
{state.status === "error" ? (
  <Banner title={t("app.loadFailed")} action={<Button variant="secondary" onClick={reload}>{t("app.retry")}</Button>}>
    {t("app.loadFailedHint")}
  </Banner>
) : state.status === "loading" ? (
  <Spinner size="md" label={ui.spinner.loading} />
) : (
  <EmptyState size="inline" title={t("home.emptyTitle")} />
)}
```

- Keep a `Load<T>` union (`loading`, `error`, `ready`) in one hook and test each state with `renderToStaticMarkup`.
- Destructive actions use a modal `Dialog` that names the thing being removed.
