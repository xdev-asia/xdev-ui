/**
 * One clip at a time for the whole page: a lazily created module-level `HTMLAudioElement` and the id of the clip
 * it plays, read with `useSyncExternalStore`. No `Audio` exists on the server, where nothing plays.
 */

let audio: HTMLAudioElement | null = null;
let playing: string | null = null;
/** Bumped on every play and stop, so a late rejection or error of an older clip changes nothing. */
let seq = 0;
let onFail: (() => void) | undefined;
const listeners = new Set<() => void>();

function set(next: string | null): void {
  if (next === playing) return;
  playing = next;
  for (const l of listeners) l();
}

function fail(token: number): void {
  if (token !== seq || playing === null) return;
  const cb = onFail;
  onFail = undefined;
  set(null);
  cb?.();
}

function element(): HTMLAudioElement | null {
  if (audio) return audio;
  if (typeof Audio === "undefined") return null;
  const el = new Audio();
  el.preload = "none";
  el.addEventListener("ended", () => {
    onFail = undefined;
    set(null);
  });
  el.addEventListener("error", () => fail(seq));
  audio = el;
  return el;
}

/** Plays `src` as clip `id`, stopping whatever played. `onError` runs if this clip fails to load or play. */
export function playAudioPreview(id: string, src: string, onError?: () => void): void {
  const el = element();
  if (!el) return;
  const token = ++seq;
  el.pause();
  onFail = onError;
  el.src = src;
  set(id);
  let started: Promise<void> | undefined;
  try {
    started = el.play();
  } catch {
    return fail(token);
  }
  started?.catch(() => fail(token));
}

/** Stops whatever preview plays, for example when the dialog that holds the list closes. */
export function stopAudioPreview(): void {
  seq++;
  onFail = undefined;
  if (audio) {
    audio.pause();
    // Dropping the source also stops the download; with no src, load() fires no error.
    audio.removeAttribute("src");
    audio.load();
  }
  set(null);
}

/** The store behind `useAudioPreview`, for `useSyncExternalStore`: the id of the playing clip, or null. */
export const audioPreviewStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => void listeners.delete(listener);
  },
  getSnapshot: (): string | null => playing,
  getServerSnapshot: (): string | null => null,
};
