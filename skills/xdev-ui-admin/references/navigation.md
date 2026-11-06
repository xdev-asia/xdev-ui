# Navigation

- **Sidebar.** `NavList` groups by task (Content, Sales, People, System), 5 to 9 items per group, nouns in plural ("Users", "Orders"). The current page is `aria-current`. Items the role can never open are not shown.
- **Breadcrumb** in the shell's `crumbs` for anything deeper than a list: Users / Ada Lovelace / Edit. The last item is the current page and not a link.
- **Tabs** split one record into views (Profile, Orders, Activity). Put the tab in the URL (`?tab=orders`) so it survives reload and can be shared. Not for steps of a process.
- **URL holds the view state.** Search, filters, sort, page and the open tab live in the query string; back and reload return to the same list.
- **Detail from a list.** A row link opens the detail page; a `Drawer` is for quick edits while the list stays visible. Back from the detail restores the list's filters and scroll.
- **Command palette.** For apps with more than about 15 pages, `CommandPalette` on Ctrl/Cmd+K jumps to pages and records.
- **After create** go to the new record (or highlight it in the list). **After delete** go back to the list and toast.
- **Leaving dirty forms** asks first: `confirmLeave()` from `useUnsavedGuard` before every in-app navigation.
