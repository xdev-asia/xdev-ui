# Console chrome

What sits around the pages of a console: search, notifications, full screen, preferences, page tabs, footer and secondary menu groups. All of it composes library parts inside `AppShell`; `examples/admin` in the library repository has the full code (`src/shell`).

## Contents
- Top bar order
- Sidebar rail and focus view
- Global search
- Notifications
- Full screen
- Preferences drawer
- Page tabs
- Secondary and nested menu groups
- External links
- Links the role cannot open
- Page title
- Test the root

## Top bar order

`actions` of `AppShell`, left to right: search (`PaletteTrigger`), notifications, language (`MenuButton variant="icon" icon="globe"` with checked items), theme (`ThemeSwitch variant="icon"`, a sun or moon, never the words), full screen, preferences, account (`Avatar` in a `Popover` with a `Menu`). Every icon-only control has a translated name. Below 768px keep four: search, notifications, preferences, account; language, theme and full screen are in preferences, and the breadcrumb hides.

## Sidebar rail and focus view

- **Rail.** `AppShell` `navCollapsed` + `onNavCollapsedChange` add a `sidebar` button at the start of the top bar that folds the sidebar to its icons; hovering an icon shows its label. Keep the choice in preferences (a "Icon sidebar" switch does the same) so it survives a reload. Every `NavList` item needs an `icon` for the rail to make sense.
- **Focus view.** A maximize `IconButton` (`aria-pressed`) at the end of the page tabs sets `chromeHidden`: sidebar and top bar go, the tabs stay, so the same button brings them back; Esc also leaves. Hide the footer too. This is "maximize the content", not the browser's full screen; offer both.

## Global search

One `PaletteTrigger` (it binds Ctrl+K and Cmd+K) opens one `CommandPalette`. Sections: with nothing typed, "Recent" (the open page tabs, newest first); then the pages the role can open (from the same nav model as the sidebar), then records (people, orders) loaded when the palette first opens. Control `query` so the recent section can go once typing starts. `onSelect` navigates by the row `id`.

```tsx
<PaletteTrigger onOpen={show} labels={ui.paletteTrigger} />
<CommandPalette
  open={open}
  onClose={() => setOpen(false)}
  sections={[
    { title: t("shell.pages"), rows: pages.map((e) => ({ id: e.href, title: t(e.label), detail: t(e.group), icon: e.icon })) },
    { title: t("shell.people"), rows: people.map((u) => ({ id: hrefFor.user(u.id), title: u.name, detail: u.email, icon: "accounts" })) },
  ]}
  labels={ui.commandPalette}
  onSelect={(row) => {
    setOpen(false);
    if (row.id) navigate(row.id);
  }}
/>
```

## Notifications

`AttentionInbox` is for agent approvals and questions. A console's general notifications compose `Popover` + `IconButton` + `ListRow`:

- The button's `label` carries the count ("Notifications, 3 unread"); the visible count badge is `aria-hidden`.
- Rows: `Icon` by kind, the message as `title`, kind and time as `meta`, and an unread `StatusDot tone="accent"` with the word "Unread", never the dot alone.
- A head row with the title and one ghost "Mark all as read"; with nothing unread, one muted line ("You are all caught up").
- Clicking an unread row marks it read. Newest first.

## Full screen

`IconButton` with `maximize` / `minimize`; call `document.documentElement.requestFullscreen()` and listen for `fullscreenchange`, since Esc leaves full screen without your button.

## Preferences drawer

`IconButton icon="sliders"` opens a `Drawer` (title, one line "Saved in this browser."). Changes apply at once; the footer has "Reset to defaults" (secondary) and "Done" (primary, closes).

- `FormSection` "Appearance": `SettingRow` with `ThemeSwitch variant="icons"` (system, dark, light as icons), `SettingRow` with a language `Select icon="globe"`.
- `FormSection` "Layout": one `SettingRow` + `Switch` per layout choice (icon sidebar, page tabs, breadcrumb, footer), each with `controlId` and `aria-describedby` on the switch.
- Store layout choices as one JSON value; read each key with its own fallback, so an old or broken value never breaks the shell.
- Leave out what xDev does not offer: other layout modes (top or two-column nav), colour-weak or grey modes, watermarks and motion switches. Motion follows the OS reduced-motion setting.

## Page tabs

A row of the pages opened this session, above the page. `TabStrip` with `onAdd={false}`, the route path as the tab `id`, the page title as `name`, and the home page `pinned` (always first, no close button). Keep the tabs in `sessionStorage`, so a reload keeps them and a new browser tab starts clean. At the end of the row: "Reload page" (`refresh`, remounts the page with a new `key`), the focus-view button, and a `MenuButton` with Close tab, Close tabs to the left, Close tabs to the right, Close other tabs and Close all tabs, each disabled when it would do nothing. Each tab gets the page's menu `icon`; `variant` picks the look (`chrome` joined tabs by default, `card`, `plain`, `brisk`); `onReorder` lets people drag tabs or press Shift+Left/Right, with the pinned home tab staying first. Store the path, not the title, and translate the title from the nav model when rendering, so tabs follow a language switch; a record's tab shows its name, not its id. Sub-views of one page (settings sections) share one tab. When the strip is wider than the screen, scroll the current tab into view on every route change by adjusting the strip's `scrollLeft` (not `scrollIntoView`, which also scrolls the page). Keep the list logic pure and tested:

```ts
/** Add once at the end, refresh the title, keep at most `max` (oldest dropped). */
export function visitTab(tabs: OpenPage[], page: OpenPage, max = 8): OpenPage[];
/** Close one, the others, the left, the right or all; home stays. When the current page closes, go to its right neighbour, else its left, else home. */
export function closeTabs(tabs: OpenPage[], action: "close" | "others" | "left" | "right" | "all", target: string, current: string): { tabs: OpenPage[]; go: string | null };
```

Make the row a preference (on by default). It scrolls sideways inside itself at any width, never the page.

## Secondary and nested menu groups

A console that mirrors a menu tree (react-antd-admin, Ant Design Pro) uses one `NavList` with `children` and `accordion`: branches are native `details`, the one holding the current page opens, and three levels is the limit. The breadcrumb lists every branch above the page. In a rail only the top level and the current branch show.

Otherwise, Demo pages, status pages and deep menus go in `NavList` groups with `collapsible`. A closed group must open when the current page is inside it: pass `defaultOpen={holdsCurrent}` and a `key` that changes with `holdsCurrent`, so the group remounts open. Two levels at most: a group title, then its pages. The breadcrumb shows group / page.

## External links

A `NavList` item that leaves the console opens a new tab with `renderLink`, and uses the `external` icon:

```tsx
renderLink={({ item, ...link }) => <a {...link} {...(isExternal(item.id) ? { target: "_blank", rel: "noreferrer" } : {})} />}
```

An embedded site goes in a `Card flush` holding an `iframe` with a translated `title`, `loading="lazy"`, `referrerPolicy="no-referrer"`, a height in `dvh`, and a "Open in a new tab" secondary `Button` in the `PageHeader`.

## Links the role cannot open

One nav model (`{ id, label, icon, href, current(route), resource }` per entry) feeds the sidebar, the search, the page tabs and a "preview as role" page, so they never disagree. A typed or shared URL to a page the role cannot read renders the not-found page (the rule is in the permissions reference); a 403 page is for a request the server refused.

## Page title

Set `document.title` to "Page · Product" on every route change, so history, bookmarks and the window switcher name the page.

## Test the root

Pages are tested as views; also render the root `App` once with `renderToStaticMarkup`. A hook that reads a context (`useI18n` inside `useToasts`) above its provider passes every view test and still leaves a blank page in the browser.

## Layouts

react-antd-admin's four menu positions, all from one nav model:
- **Side** (default): `NavList` in `nav`.
- **Top**: `AppShell navHidden` drops the sidebar from 768px up and puts `brand` in the top bar; put a `nav` of sections in `crumbs`, a `MenuButton variant="ghost"` per section with children (the current one `secondary`), and move sections that do not fit into a "More" (`MenuButton variant="icon" icon="more"`) instead of cutting a label. Phones still get the drawer, so pass the full `nav` too.
- **Mixed**: sections in the top bar, the current section's pages in the sidebar; a section without pages hides the sidebar.
- **Two columns**: a narrow column of section links, then the current section's `NavList`.
`sideTheme="dark" | "light"` draws the sidebar in that theme whatever the page uses. Widths are tokens: set `--w-side` (sidebar) and `--w-rail` (folded rail) on `:root` from preferences; on phones the drawer keeps at least 17.5rem.
