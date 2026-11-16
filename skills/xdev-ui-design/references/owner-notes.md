# Owner's design notes

Decisions the product owner made while reviewing xDev screens. They win over the general rules when the two disagree. Each note says what was asked, so you can tell when it applies.

## Contents
- Porting a reference product 1:1
- Top bar
- Sidebar and brand
- Cards and rows
- Usage overview and topology
- Responsive
- How to check before you say "done"

## Porting a reference product 1:1
- "Port 1:1" means the geometry matches too, not only the page list. Open the reference app and the port side by side at 1440px and measure with `getBoundingClientRect` and `getComputedStyle`: x, y, width, height, font size and weight, radius. Fix every difference you can, then list the rest.
- Keep xDev's colours, fonts, tokens, logo and copy. Geometry follows the reference; the look stays xDev.
- When asked "is it the same yet?", answer with the measured numbers for both apps, not an impression. Name each gap that remains and why (a library rule, a missing feature).
- A size the reference needs and the library lacks goes into xdev-ui (a token or a component option), never app CSS.

## Top bar
- The top bar and the page are one surface: the bar has the page's background (`--bg-0`), no rule under it, and no rule under the sidebar brand beside it. A thin rule may appear only once the page has scrolled, so content does not slide under the title unmarked. Never a lighter band with a border under it: the owner reads that as a separate box, and cards cut off under the rule show their rounded corners. This is the titled `AppShell` default; do not paint the bar from app CSS.
- The page title is the reference's: a bare 24px page icon in the accent (no tile, no plate), the title at 24px, weight 600 (the shell title type) beside it, and the one-line description on the line under both. The icon is the same one the page has in the sidebar.
- Header controls are icon buttons, not text controls. No segmented control, no select, no text button in the top bar.
  - Theme: one round icon button that flips dark and light (sun on a dark page, moon on a light page), labelled with what a click does ("Switch to light mode"). System stays reachable in the account menu.
  - Language: a globe icon button that opens a menu with the languages, the current one checked.
  - Account and other actions: one icon button with a menu, last in the row.
  - All of them are 40px with a 20px glyph, 8px apart; only the theme button is round.
- Search for the page may sit in the top bar, left of the icon buttons.

## Sidebar and brand
- The brand at the top of the sidebar is the current logo (v12) as a 36px app tile, the product name beside it and the version under the name.
- The sidebar keeps the reference's item order. Do not add sections the product does not have to look complete; name the missing ones in your report instead.

## Cards and rows
- Never a rounded card or row with a coloured left stripe (`border-left` or an inset `box-shadow`). Show state with a background tint, a full 1px border, or a status dot with words.

## Usage overview and topology
- A usage overview of a gateway or router shows its topology: the reference's map of the connected providers around the product. Do not drop it because the totals are already there; the owner reads its absence as a missing part.
- Order under the stat tiles: the map in a bordered panel at about two thirds of the width, and the recent requests (time, model, status, a "View all" button that opens the details) at one third, both the same height (480px). One column below 1024px. Charts and per-provider tables follow.
- Build it with the xdev-ui `FlowMap` (hub plus nodes on a grid, zoom in, zoom out and fit at the bottom left). The hub is the product's own `BrandMark`; each node is a provider with an account or with traffic in the period, with its logo, by name, and "N requests" under the name when it carried traffic. Never hand-draw the map in app CSS or SVG.

## Responsive
- Asked: "xdev-ui hỗ trợ responsive luôn, lúc dùng thư viện này cũng phải responsive". Every page built with xdev-ui works on a phone, a tablet and a desktop, not only at 1440px.
- Check every changed page at three widths: **375** (phone), **768** (tablet; the sidebar is still a drawer), **1440** (desktop). Drag to 320 once to look for a scrollbar.
- No horizontal page scroll at any of them. Wide content (tables, code, logs, charts) scrolls inside its own box.
- Take the screenshot at 375 too, not only at 1440. A "done" without a phone screenshot is not done.
- Use what the library already does (wrapping headers, sheet dialogs, full-width drawers, `DataTable sticky` / `stack`, 44px touch targets) instead of app CSS. A layout the library cannot do goes into xdev-ui, not the app.
- At most three icon actions in the top bar on a phone; the rest go in the account menu.

## How to check before you say "done"
1. Run the audit and the tests of every repo you touched.
2. Rebuild and redeploy what the owner looks at (the local container), sign in, and open the page.
3. Screenshot dark and light at 1440px next to the reference, and at 375 and 768; measure the parts you changed and look for a horizontal page scrollbar.
4. Report what matches, what does not, and what you did not check. Do not call it the same until the numbers say so.
