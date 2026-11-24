# Rebuilding an admin template from another kit

How to rebuild an admin template made with Ant Design, Ant Design Pro, MUI or shadcn (react-antd-admin, vben, Refine demos) on `@xdev-asia/ui`. Keep the template's pages, information and order; replace every part with the xDev one below. The look comes from `xdev-ui-design` and its porting guide.

## Contents
- Steps
- Part map
- What not to carry over

## Steps

1. **Inventory.** List every route from the template's router or menu config, one row per page, with what it shows and its actions. Read the source when it is available: a live demo hides states (empty, error, no access) and modes (code sign-in, register).
2. **Map.** Give each row its page pattern from the `xdev-ui-admin` table and each widget its part from the map below. Mark the gaps: a widget with no part.
3. **Gaps.** Compose library parts when the composition is small and keeps the part's rules (a notification list from `Popover` and `ListRow`). When it needs new keyboard or ARIA behaviour (a tree grid, a transfer list), it belongs in `@xdev-asia/ui`; build the page without it and say so.
4. **Build** the shell first (console chrome reference), then one page per pattern, each a pure view with tests, then the remaining pages.
5. **Review** with `xdev-ui-review`, then screenshots at 375 and 1440px, dark and light, beside the template's own.

## Part map

| Ant Design or Pro | `@xdev-asia/ui` |
|---|---|
| `ProLayout`, `Layout` with `Sider` and `Header` | `AppShell` (`nav`, `crumbs`, `actions`) |
| `Menu` in the sider, sub-menus (accordion) | one `NavList` with `children` (up to three levels) and `accordion`; the branch with the current page opens |
| sider collapse trigger (`MenuFold`, collapsed width) | `AppShell` `navCollapsed` (a rail of icons); the fold button in `navFooter`, as at the foot of the sider, or `onNavCollapsedChange` for one in the top bar |
| `Breadcrumb` | `Breadcrumb` in `crumbs` |
| multi-tab bar (keep-alive tabs), tab right-click menu, refresh | `TabStrip` with `onAdd={false}`, home `pinned`, a `MenuButton` of close actions, a reload `IconButton` |
| tab "maximize" (content full screen) | `AppShell` `chromeHidden` |
| header theme button, theme tiles in settings | `ThemeSwitch variant="icon"` in the top bar, `variant="icons"` in preferences |
| header language dropdown | `MenuButton variant="icon" icon="globe"` with checked items |
| global search modal | `PaletteTrigger` + `CommandPalette` |
| notification bell with `Badge` | `Popover` + `IconButton` + `ListRow` + `StatusDot` |
| settings drawer (theme, layout) | `Drawer` + `SettingRow` + `ThemeSwitch`, `Select`, `Switch` |
| `ProTable`, `Table` | `DataTable` + `SearchInput`, `FilterChip` or `FacetFilter`, `Pagination`, `BulkBar` |
| `Table` with tree data | `DataTable` with tree rows (tree list reference) |
| `Popconfirm` on delete | `Dialog` with `alert` naming the object, or do it and offer Undo in a `Toast` |
| `Modal`, `ModalForm` | `Dialog`, `FormDialog` (up to about 5 fields) |
| `Drawer`, `DrawerForm` | `Drawer` with the form and a footer of Cancel then Save |
| `ProForm`, `Form` on a page | `FormSection` + `Field`, `Select`, `Textarea`, `Switch`, `SaveBar` + `useUnsavedGuard` |
| `Input.Search` | `SearchInput` |
| `Select` | `Select` (short list), `Combobox` (tens to hundreds), `SearchPicker` (server search) |
| `Radio.Group` of buttons, `Segmented` | `Segmented` |
| `DatePicker`, `RangePicker` | `DatePicker`, `DateRangePicker`, `TimeField` |
| `Upload`, avatar upload | `FileDrop`, `ImageField` (`/image`) |
| `ColorPicker` | `ColorField`, `SwatchGroup` |
| `Statistic`, count-up cards | `StatTile` (no count-up animation; say what the number is compared with) |
| ECharts line or area | `TimeSeriesChart` |
| ECharts bar | `BarChart` |
| ECharts pie or donut | `BarChart` sorted largest first, values in % (bars compare shares more exactly than slices) |
| `Progress` | `Meter` |
| `Descriptions` | `DescriptionList` |
| `Tag` | `Tag`; a state is `StatusDot` with words, not a coloured tag |
| `Badge` count | `Badge` or the `count` of a `NavList` item |
| `Result` (403, 404, 500, success) | `EmptyState size="center"` |
| `Empty` | `EmptyState` |
| `Alert` | `Banner` |
| `message`, `notification` | `Toast` (one line, past tense) |
| `Spin`, page loading | `Skeleton` in the shape of the region, `Spinner` in a control |
| `Steps` | `StepDots`, or `EmptyState` with `steps` for first-run |
| `Dropdown` | `MenuButton` |
| `Tooltip` | `Tooltip`, never the only place for a reason |
| `Avatar` | `Avatar` for people; `Emblem` for things |
| `Card` | `Card` (no shadow; `flush` for edge-to-edge content) |
| `Tree` with checkboxes, `TreeSelect`, `Transfer` | gap: a `Checkbox` matrix for permissions today; propose the part for the library |
| split login page (art left, form right), password, code, register, forgot | `AuthShell` (headline, tagline, language and theme in `actions`, copyright and legal links in `footer`), a `Segmented` for password or code, `CodeInput`, links to reset and register (sign-in reference) |
| access demo (page control, button control, role-only pages) | real account switch, the nav model filtered by role, `can()` for buttons, `EmptyState` for the role-only pages |
| privacy policy, terms of service (public routes) | `Prose` in a `Container`, open before sign-in |

## What not to carry over

- Layout switchers (side, top, mixed, two-column nav), sidebar themes, colour presets and radius sliders, colour-weak or grey modes: xDev has one shell, two themes and one accent. Offer the rail and the focus view instead.
- Version polling and back-to-top buttons: add them only when the product needs them; the shell scrolls `main`, and a long page gets a `Pagination` or section links.
- Watermarks, page transition and loading-bar animations, count-up numbers: motion follows `xdev-ui-motion`.
- Primary-coloured filled headers, gradient cards, coloured left borders on cards and stat tiles.
- Chinese-first copy: write `en` and `vi` from the start, sentence case, no exclamation marks.
- A hidden route reached by URL shows 403 in many templates; in xDev a page the role cannot read shows not-found.
