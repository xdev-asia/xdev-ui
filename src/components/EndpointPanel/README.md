# EndpointPanel

The address a client points at: a `Card` with the base URL in a `CodeBlock` to copy, the paths under it as mono tags, and an aside for a picture of the route (`RouteDiagram`). First thing on a gateway's or an API's overview page.

## Anatomy
`Card.x-endpoint` > `div.x-endpoint-body` > `div.x-endpoint-main` (`CodeBlock` + `ul.x-endpoint-paths` > `li` > `Tag` > `.x-endpoint-path`) + `div.x-endpoint-aside`. The body is two columns from 720px of card width when there is an aside, one column below.

## Rules
- One URL per panel, the one a client sets as its base URL. Show it whole; never truncate or mask it.
- Paths are what answers under that URL, full ("/v1/chat/completions"), at most about six.
- `actions` holds at most one primary `Button` (for example "Create key"); the copy button is the CodeBlock's.
- `labels` (`copy`, `copied`, `paths`) override the English defaults.
