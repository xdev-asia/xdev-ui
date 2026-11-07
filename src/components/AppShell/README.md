# AppShell

Page frame for a generic app or an admin console: a sidebar for navigation, a top bar and the main area, with a drawer on narrow screens.

## Anatomy
`div.x-shell` > `a.x-skip-link`, `aside.x-shell-side` (`.x-shell-brand`, `.x-shell-nav`, `.x-shell-side-foot`), `.x-shell-col` > `header.x-shell-top` (`button.x-shell-menu`, `.x-shell-crumbs`, `.x-shell-actions`) + `main.x-shell-main`, `div.x-shell-bottom` (the `bottomNav` slot, below `main`), optional `button.x-shell-backdrop` and `.x-shell-toasts`. The sidebar is `--w-side` wide and the top bar `--h-header` high.

## Rules
- Navigation is `NavList` (with `icon`) in `nav`. `ActivityBar` and `TabStrip` belong to the workspace app, not to a generic app.
- Put a `BrandMark` and the product name in `brand`, a `Breadcrumb` in `crumbs`, and search, notifications and the account `Menu` in `actions`. Page titles and page actions go in `PageHeader`, inside `children`.
- Below 768px the sidebar is an off-canvas drawer: the menu `IconButton` in the top bar opens it, opening it moves focus to the first control in the sidebar and makes the page column `inert`; Tab and Shift+Tab wrap between the backdrop and the sidebar, the backdrop and Esc (anywhere in the document) close it, and focus returns to the menu button. The menu button has `aria-controls` pointing at the sidebar. Own the state: `navOpen` and `onNavOpenChange`, and close it when the route changes.
- Below 768px a `BottomNav` in `bottomNav` sits under `main`, outside the scroll area, and the page column (bottom bar included) goes `inert` while the drawer is open. From 768px up the slot is hidden; the sidebar carries the same destinations. Toasts move above the bar. Keep the sidebar and the bar in sync from one list of destinations.
- The skip link is the first focusable element and focuses `main` without changing `location.hash`, so hash-routed apps keep their route; `mainId` changes the target id.
- Landmarks: the sidebar is `aside` named by `labels.nav`, `header`, `main`. Each `NavList` is its own `nav` with its own name.
- `toasts` render in a fixed bottom-right `.ws-toasts` region; pass `Toast` elements.
- `labels` (`AppShellLabels`: `openNav`, `closeNav`, `skipToContent`, `nav`) overrides the English defaults; pass translated strings from the app.
- The shell scrolls `main`, not the page. Wide content scrolls inside its own wrapper, never the whole page.
