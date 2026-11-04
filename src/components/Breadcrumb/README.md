# Breadcrumb

Path from a root to the current place, such as repo, folder and file, with the earlier parts clickable.

## Anatomy
`nav.ws-crumbs` > `ol.ws-crumbs-list` > `li.ws-crumb-item` > `.ws-crumb` (button, link or text) + `span.ws-crumb-sep` ("/", aria-hidden).

## Rules
- The last item is the current place: plain text with `aria-current="page"`, never a link.
- Set `mono` for paths, branch names and ids; keep it off for product nouns ("Settings").
- Each crumb truncates with an ellipsis; keep the full value in a `title` when it is cut.
- Use it in headers of a pane or page, not as primary navigation.
- `labels.breadcrumb` (`BreadcrumbLabels`) names the nav landmark.
