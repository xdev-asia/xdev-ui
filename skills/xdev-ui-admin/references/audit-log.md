# Audit log

A read-only list of events, newest first, with filters and an export.

```tsx
<PageHeader title={t("audit.title")} actions={canExport ? <Button variant="secondary" icon="download" onClick={onExport}>{t("audit.export")}</Button> : undefined} />
<Field label={t("audit.from")} type="date" value={filters.from} onChange={(e) => change({ from: e.target.value })} />
<Field label={t("audit.to")} type="date" value={filters.to} onChange={(e) => change({ to: e.target.value })} />
<FilterChip pressed={filters.kinds.has(k)} onClick={() => toggle(k)}>{t(`audit.actions.${k}`)}</FilterChip>
<Disclosure title={t("audit.details")} defaultExpanded={false}>
  <DescriptionList items={[{ term: t("audit.ip"), value: e.ip, mono: true }]} />
</Disclosure>
```

- `filterAudit(events, filters)` is pure: actor text (case-insensitive), chosen kinds, inclusive date range compared as `yyyy-mm-dd` strings.
- `auditCsv(events)` is pure: a header line, one line per event, cells with commas or quotes wrapped in quotes with quotes doubled. Build the file with `Blob` and an object URL in the click handler only.
- Time and target columns use `mono`; the details column is `hideNarrow`.
- Export is for roles that may read the log; hide it for others.
