# States and feedback

Every region that loads data has four states. Write each as a branch of the pure view and test it with `renderToStaticMarkup`.

| state | show |
|---|---|
| loading, first time | `Skeleton` in the shape of the content (`announce` on one per region); `loading` on `DataTable` and `StatTile` |
| loading, refresh | keep the old data, `busy` on the trigger or a `Spinner` in the toolbar; no skeleton flash |
| error | `Banner` whose `title` says what failed, with a secondary "Try again" `action`; keep any data already shown |
| empty, no data yet | `EmptyState` with icon, title, hint and the create action |
| empty, filters match nothing | `EmptyState` naming the search text, action "Clear filters" |
| success of an action | `Toast` that names the object ("User Ada suspended"), with Undo (`actionLabel`, `onAction`) when possible |

```tsx
if (state.kind === "loading") return <Skeleton shape="block" height="320px" announce labels={ui.skeleton} />;
if (state.kind === "error") return <Banner title={t("users.loadFailed")} action={<Button variant="secondary" onClick={retry}>{t("common.retry")}</Button>} />;
```

## Rules
- Show a skeleton only after about 300 ms, so fast loads do not flicker; never leave it after an error.
- One message per problem, in one place: a field error is not also a toast.
- Toasts: one line, no action except Undo, never for errors that need action.
- `Meter` for a share of a limit (storage, quota), `StatusDot` with text for a state, `Badge` for a count.
- Long jobs (exports, imports): start them, show progress in a `Banner` or the row, and notify on completion; do not block the page.
