# Changelog

## 2.5.0

### Breaking

- `Button`: the default `variant` is now `secondary` (was `primary`). Every `<Button>` that is the one main action of a surface must pass `variant="primary"`. Buttons that already set a variant are unchanged. Inside this package the components, stories, previews, examples, templates and the `primary-count` audit rule were updated to match.
- `ActivityBar`: the current app no longer has an accent fill and glow. It keeps `aria-current="page"`, gets a `--x-color-surface-2` tint and a 2px accent pip at the bar edge.

### Layout v2 parts

New parts follow in this release line: `AttentionInbox`, `WorktreeRow`, `SessionBar`, `ApprovalBar`, `Composer`, `PanelTabs`, `LaunchCard`, `UsageMeterRow`.
