# AudioPreview

Round play/stop toggle for listening to a short clip in a list (library rows, pickers); only one clip plays on the whole page, so starting another stops the current one.

## Anatomy
`button.ws-icon-btn.x-audio-preview[aria-pressed]` with the `play` or `stop` icon. With `label`, `button.btn-secondary.x-audio-preview[aria-pressed]` with the icon and the visible text. One hidden `HTMLAudioElement` (`preload="none"`) is created on the first play and shared by every preview on the page.

## Rules
- One clip at a time: `play` on another clip stops the current one. `id` (default `src`) names the clip, so two rows with the same file show the same state unless they pass their own `id`.
- `aria-pressed` is `true` while the button's clip plays; the icon turns from play to stop and the name from `labels.play` to `labels.stop` (aria-label and title). With a visible `label` the text stays the accessible name and the play/stop name goes in `title` only.
- The button returns to play when the clip ends, fails to load, or `play()` is refused (autoplay policy, bad URL); `onError` runs on a failure so the app can say why.
- Unmounting the playing button does not stop the sound. Call `stopAudioPreview()` when the surface that holds the list closes (a `Dialog`, a `Drawer`, a route change).
- `useAudioPreview()` returns `{ playingId, play(id, src, onError?), stop() }` for a custom control or for highlighting the playing row; `audioPreviewStore` is the raw store for `useSyncExternalStore`.
- Server render: nothing plays and no `Audio` is created; every button renders idle.
- `size`: `sm` (default, 22px, dense rows) or `md` (26px). Touch pointers get the 44px hit area of `IconButton`.
- `labels` (`AudioPreviewLabels`: `play`, `stop`) overrides the English defaults; pass translated strings from the app.
- For a full player with a timeline and volume, use the platform `<audio controls>`; this part is only for a quick listen.
