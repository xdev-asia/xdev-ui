# AppShell

Page frame for a generic app or an admin console: a sidebar for navigation, a top bar and the main area, with a drawer on narrow screens.

## Anatomy
`div.x-shell` > `a.x-skip-link`, `aside.x-shell-side` (`.x-shell-brand`, `.x-shell-nav`, `.x-shell-side-foot`), `.x-shell-col` > `header.x-shell-top` (`button.x-shell-menu`, optional `.x-shell-heading`, `.x-shell-crumbs`, `.x-shell-actions`) + `main.x-shell-main`, `div.x-shell-bottom` (the `bottomNav` slot, below `main`), optional `button.x-shell-backdrop` and `.x-shell-toasts`. The sidebar is `--w-side` wide and the top bar `--h-header` high.

## Rules
- Navigation is `NavList` (with `icon`) in `nav`. `ActivityBar` and `TabStrip` belong to the workspace app, not to a generic app.
- Put a `BrandMark` and the product name in `brand`, a `Breadcrumb` in `crumbs`, and search, notifications and the account `Menu` in `actions`. Page titles and page actions go in `PageHeader`, inside `children`.
- Console layout: put a `ShellTitle` in `title` instead. The top bar grows to two `--x-space-8` (64px) and holds the page's icon, h1 and description; page actions stay in `children`. Do not also render a `PageHeader` title, or the page has two h1. The titled top bar shares the page's surface (`--bg-0`) with no rule under it or under the sidebar brand; a rule fades in once `main` scrolls (scroll-driven animation; browsers without it keep no rule).
- `drawerBelow="lg"` makes the sidebar a drawer below 1024px instead of 768px, with the same focus rules; the `BottomNav` still shows only below 768px.
- Below 768px (or 1024px with `drawerBelow="lg"`) the sidebar is an off-canvas drawer: the menu `IconButton` in the top bar opens it, opening it moves focus to the first control in the sidebar and makes the page column `inert`; Tab and Shift+Tab wrap between the backdrop and the sidebar, the backdrop and Esc (anywhere in the document) close it, and focus returns to the menu button. The menu button has `aria-controls` pointing at the sidebar. Own the state: `navOpen` and `onNavOpenChange`, and close it when the route changes.
- Below 768px a `BottomNav` in `bottomNav` sits under `main`, outside the scroll area, and the page column (bottom bar included) goes `inert` while the drawer is open. From 768px up the slot is hidden; the sidebar carries the same destinations. Toasts move above the bar. Keep the sidebar and the bar in sync from one list of destinations.
- The skip link is the first focusable element and focuses `main` without changing `location.hash`, so hash-routed apps keep their route; `mainId` changes the target id.
- Landmarks: the sidebar is `aside` named by `labels.nav`, `header`, `main`. Each `NavList` is its own `nav` with its own name.
- `toasts` render in a fixed bottom-right `.ws-toasts` region; pass `Toast` elements, not a `Toaster`. The region and its two live regions (`.x-toast-live`: assertive for `danger` toasts, polite for the rest) are always mounted, even with no toasts, so the first toast is announced; the empty region lets clicks through.
- **Rail.** `navCollapsed` folds the sidebar to its icons from 768px up (1024px with `drawerBelow="lg"`); with `onNavCollapsedChange` the top bar gets a `sidebar` `IconButton` (`aria-expanded`, `aria-controls`) that folds and unfolds it. Labels, counts and group titles stay in the DOM for screen readers; each item shows its label as a hover title; only the first child of `brand` (the mark) shows. The width changes at once, without a transition. Store the choice with the app's other preferences.
- **Focus view.** `chromeHidden` hides the sidebar and the top bar so the page fills the window (a "maximize content" button). The app keeps a visible way back in the page (the same button) and binds Esc to leave it.
- `labels` (`AppShellLabels`: `openNav`, `closeNav`, `skipToContent`, `nav`, `collapseNav`, `expandNav`) overrides the English defaults; pass translated strings from the app.
- The shell scrolls `main`, not the page. Wide content scrolls inside its own wrapper, never the whole page.

## Responsive
- The top-bar action slot shrinks with the title instead of pushing past the edge; icon buttons keep their size and a `SearchInput` in it takes the free space.
- Below 768px a long `ShellTitle` wraps to two lines instead of an ellipsis, and the titled top bar grows to fit. From 640px up the title keeps at least `min(12rem, 35%)`. Below 640px an empty search collapses to a 44px icon and opens while it has focus.
- Keep at most three icon actions in the top bar on a phone; move the rest into an account `Menu`.
