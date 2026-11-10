# SiteShell

Frame for a small public web page, such as the account portal, a sign-in page or legal pages: a top bar, a centred main region and footer links.

## Anatomy

`div.x-site` > `header.x-site-header` > `Container.x-site-bar` (`.x-site-brand` + optional `.x-site-actions`), then `Container[as=main].x-site-main`, then optional `footer.x-site-footer` > `Container.x-site-footer-inner` > `nav[aria-label]` of links + `footer` content.

## Rules

- Use it for web pages outside the desktop app. The app itself uses `AppShell`.
- `brand` is a link home with `BrandMark` and the product name; never recolour the mark.
- `actions` holds at most a language `Select` and one button; no primary button in the bar.
- The main region already has the gutter and the width; do not wrap the page in another `Container`.
- Footer links are plain text links in muted colour; pass a translated `linksLabel` for the nav.
- The footer stays at the bottom of short pages; the bar wraps under 360px instead of overflowing.
