# Tree lists and status pages

## Contents
- Tree list in a DataTable
- Filtering a tree
- Editing a node
- Status pages

## Tree list in a DataTable

Menus, departments, categories and folders are trees an admin scans as rows. `TreeView` is the file tree of the workspace (git marks, files and folders); for records with columns, keep `DataTable` and flatten the tree yourself:

```ts
export interface TreeNode<T> { id: string; data: T; children?: TreeNode<T>[] }
/** The rows to show, depth first, skipping the children of closed nodes. */
export function visibleRows<T>(tree: TreeNode<T>[], expanded: ReadonlySet<string>, depth = 0): TreeRow<T>[];
```

- The first column is the name, indented by depth (`padding-inline-start: calc(depth * var(--x-space-6))`), with an `IconButton size="sm"` that opens and closes the node: `chevron-right` closed, `chevron` open, `aria-expanded`, and a label that names the node ("Expand Engineering"). A leaf gets a same-width spacer so names line up.
- Above the table: a `SearchInput` filter, "Expand all" and "Collapse all" secondary buttons (disabled while filtering).
- A count in the `PageHeader` `meta` (`Tag`: "19 items") counts every node, open or not.
- Use `stack` on the `DataTable` so a phone gets cards; hide path and code columns there with `hideNarrow`.
- `DataTable` has no tree semantics (`treegrid`); the buttons carry the state for assistive technology. If a tree needs arrow-key navigation between rows, the part belongs in `@xdev-asia/ui`, not in the app.

## Filtering a tree

Keep the ancestors of every match, and open every branch while a filter is on, so a match is never hidden in a closed node:

```ts
const shown = q ? filterTree(tree, (m) => m.name.toLowerCase().includes(q)) : tree;
const rows = visibleRows(shown, q ? new Set(branchIds(shown)) : expanded);
```

With no match, the `empty` slot holds an `EmptyState` with "Clear the filter".

## Editing a node

A row action `IconButton icon="edit"` (only for roles that can edit; hide the column otherwise) opens a `Drawer` with the node's fields: `Field` for name, path and code (`mono`), `Select` for the kind, a number `Field` for the order and a `Switch` for whether it shows. Save replaces the node with a pure `updateNode(tree, id, data)` and shows a past-tense toast.

## Status pages

Whole-page states use `EmptyState size="center"`, one icon, one statement and one hint, and at most two buttons, the primary last:

| page | icon | title | actions |
|---|---|---|---|
| 403, the server refused | `lock` | "You cannot open this page" | "Go to dashboard" (primary) |
| 404, no such page, or a page the role cannot read | `search` | "Page not found" | "Go to dashboard" (primary) |
| 500, the server failed | `alert` | "Something went wrong on our side" | "Go to dashboard" (secondary), "Try again" (primary) |

Never show a stack trace or an error code alone; the code may go in the hint for support ("Error 500"). The shell stays around a status page so the person can navigate away.
