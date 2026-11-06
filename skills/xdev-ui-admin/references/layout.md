# Layout

## Contents
- Shell and page
- Container, Stack, Grid
- Breakpoints
- With Tailwind

## Shell and page
- One `AppShell` per app: `brand`, `nav` (a `NavList`), `crumbs` (`Breadcrumb`), `actions` (account menu), `toasts`. Below 768px the nav is a drawer controlled by `navOpen` / `onNavOpenChange`; close it when an item is picked.
- Each page: `PageHeader` (the only `h1`, actions at the end, primary last), then the content, then `SaveBar` last when the page edits a long form.
- Design at 360px first. No horizontal page scroll: only a `DataTable` scrolls sideways, inside its own wrapper.

## Container, Stack, Grid

```tsx
<Container size="xl">                       {/* lists, dashboards; "md" for forms; "full" for wide tables */}
  <Stack gap={6}>
    <PageHeader title={t("dashboard.title")} />
    <Grid columns={{ base: 1, sm: 2, xl: 4 }} gap={4}>
      <StatTile label={t("stats.users")} value={users} />
      {/* … */}
    </Grid>
    <Grid columns={{ base: 1, lg: 3 }}>
      <GridItem span={{ base: 1, lg: 2 }}><Card title={t("orders.recent")}>…</Card></GridItem>
      <Card title={t("activity.title")}>…</Card>
    </Grid>
  </Stack>
</Container>
```

- `Stack` replaces margins between siblings: `gap` 1, 2, 3, 4, 6, 8 (4 to 32px). Rows wrap by default. Action rows: `direction="row" justify="end"`.
- `Grid` `columns` is a number or one per breakpoint; a key applies from its width up and falls back to the next smaller key. `minItemWidth="16rem"` fits as many cards as there is room for.
- Inside a `Drawer`, a split pane or a side panel use `responsive="container"`: the columns follow the grid's own width.
- `GridItem span="full"` for a row-wide title or banner; spans never exceed the column count.
- Form fields stay in one column; `FormSection columns={2}` only for short pairs (first and last name, city and postcode).

## Breakpoints
sm 640, md 768, lg 1024, xl 1280, 2xl 1536 (`--x-bp-*`, `BREAKPOINTS`, Tailwind's defaults). Lay out with CSS. Use `useBreakpoint()` only for behaviour CSS cannot express (open a `Drawer` instead of a side panel below `lg`): it returns "base" on the server and the first client pass, so the first paint must work at any width.

```ts
const bp = useBreakpoint();
const asDrawer = !atLeast(bp, "lg");
```

## With Tailwind
An app on Tailwind v4 imports the theme once:

```css
@import "tailwindcss";
@import "@xdev-asia/ui/styles.css";
@import "@xdev-asia/ui/tailwind.css";
```

- Utilities then speak the tokens: `bg-panel`, `bg-surface`, `text-ink`, `text-muted`, `border-line`, `bg-accent text-on-accent`, `text-danger`, `bg-warn-soft`, `rounded-md`, `font-mono`, `md:grid-cols-2`.
- `p-4` is 16px (`--x-space-1` is 4px, the same step). Shadows and z-index have no names: `shadow-(--shadow-menu)`, `z-(--x-z-modal)`.
- Never use Tailwind's palette (`bg-gray-100`, `text-blue-600`) or arbitrary values (`p-[13px]`, `text-[#333]`); they skip the theme.
- Components first; utilities only for page glue the components do not cover.
