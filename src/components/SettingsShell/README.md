Settings page frame: a search box over grouped navigation on the left, the settings rows in the middle, and a sticky slot for a `SaveBar` at the bottom.

## Anatomy
`div.x-settings-shell` > `div.x-settings-shell-side` (`SearchInput` + one `NavList` per group) + `div.x-settings-shell-main` > `div.x-settings-shell-content` (your rows) + `div.x-settings-shell-save` (`saveBar`).

## Rules
- Use it for an app settings page with more than about eight rows. A short form is a `FormSection`; the page title is a `PageHeader` above the shell.
- Keep the groups few (six or fewer) and the items one per section. Each item `id` is the `id` of the `SettingRow` or section it jumps to.
- Choosing an item calls `onChange(id)` and scrolls the element with that id into view. The shell never resolves ids by polling; render the rows first so the element exists.
- Search matches the item label and its `keywords`, ignoring case and diacritics ("cai dat" finds "Cài đặt"). Groups with no match disappear from the nav. Enter in the search box jumps to the first match. The result count is read out politely.
- To hide rows that do not match, pass `children` as a function: `(state) => ...` with `state.visible(id)`, `state.query` and `state.matches`. Plain `children` is not filtered. With a query that matches nothing the shell shows `labels.empty(query)` instead of the content.
- `saveBar` is sticky at the bottom of the content area. Pass a `SaveBar` (it renders nothing until the form is dirty); the empty slot takes no space.
- `query` and `onQuery` are controlled, so the app can keep the query in the URL. `value` is the selected item id; the nav item gets `aria-current="page"`.
- `labels` translates `search`, `clear`, `count` and `empty`. Group and item labels are yours.
- Below 768px the nav stacks above the content (at most 40vh, scrolls) and the padding shrinks. It works at 360px.
- The helpers `matchesSetting(item, query)` and `filterSettingsGroups(groups, query)` are exported for apps that build their own command or result list.
