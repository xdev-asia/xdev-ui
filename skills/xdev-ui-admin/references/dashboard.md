# Dashboard

Four `StatTile` in a grid, a `Card` with recent activity, a `Card` with usage `Meter`s. Each tile takes `loading`, so the page shows its layout while data loads.

```tsx
<div className="app-grid">
  <StatTile labels={ui.statTile} loading={loading} label={t("dashboard.activeUsers")} value={data ? num(data.activeUsers) : ""} delta="+4%" deltaTrend="up" deltaTone="good" hint={t("dashboard.vsLastWeek")} />
  <StatTile labels={ui.statTile} loading={loading} label={t("dashboard.storage")} value={data ? `${num(data.storageGb)} GB` : ""}>
    {data ? <Meter value={data.storageGb} warnAt={80} label={t("dashboard.storage")} /> : null}
  </StatTile>
</div>
<Card title={t("dashboard.recentActivity")} actions={<Button variant="secondary" onClick={onViewAudit}>{t("dashboard.viewAudit")}</Button>} flush>
  <ul className="app-list">
    <ListRow as="li" title={t(`audit.actions.${e.kind}`)} meta={`${e.actor} · ${date(e.time, true)}`} />
  </ul>
</Card>
```

- `deltaTone` is your call: more failed sign-ins is `bad` even though the arrow points up.
- Error: a `Banner` with a secondary "Try again" `Button`, replacing the content.
- Empty list: `EmptyState` size `inline`.
- The grid class uses `repeat(auto-fit, minmax(min(100%, 22ch), 1fr))`, so it works at 360px.
