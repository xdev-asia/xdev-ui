import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Store = typeof import("./audio-preview-store");

/** Stand-in for HTMLAudioElement: play() returns a promise the test settles. */
class FakeAudio {
  static all: FakeAudio[] = [];
  preload = "";
  src = "";
  paused = true;
  listeners: Record<string, Array<() => void>> = {};
  plays: Array<{ resolve: () => void; reject: (e: unknown) => void }> = [];
  pause = vi.fn(() => void (this.paused = true));
  load = vi.fn();
  removeAttribute = vi.fn((n: string) => {
    if (n === "src") this.src = "";
  });
  constructor() {
    FakeAudio.all.push(this);
  }
  addEventListener(type: string, fn: () => void) {
    (this.listeners[type] ??= []).push(fn);
  }
  emit(type: string) {
    for (const fn of this.listeners[type] ?? []) fn();
  }
  play() {
    this.paused = false;
    return new Promise<void>((resolve, reject) => this.plays.push({ resolve, reject }));
  }
}

const flush = () => new Promise((r) => setTimeout(r, 0));
let s: Store;

beforeEach(async () => {
  FakeAudio.all = [];
  vi.resetModules();
  vi.stubGlobal("Audio", FakeAudio);
  s = await import("./audio-preview-store");
});
afterEach(() => vi.unstubAllGlobals());

describe("audio preview store", () => {
  it("creates one element lazily, with preload none, and plays the clip", () => {
    expect(FakeAudio.all).toHaveLength(0);
    expect(s.audioPreviewStore.getSnapshot()).toBeNull();
    s.playAudioPreview("a", "/a.mp3");
    expect(FakeAudio.all).toHaveLength(1);
    const el = FakeAudio.all[0];
    expect(el.preload).toBe("none");
    expect(el.src).toBe("/a.mp3");
    expect(s.audioPreviewStore.getSnapshot()).toBe("a");
    s.playAudioPreview("b", "/b.mp3");
    expect(FakeAudio.all).toHaveLength(1);
  });
  it("starting another clip stops the current one and notifies subscribers", () => {
    const seen: Array<string | null> = [];
    const off = s.audioPreviewStore.subscribe(() => seen.push(s.audioPreviewStore.getSnapshot()));
    s.playAudioPreview("a", "/a.mp3");
    s.playAudioPreview("b", "/b.mp3");
    const el = FakeAudio.all[0];
    expect(el.pause).toHaveBeenCalledTimes(2);
    expect(el.src).toBe("/b.mp3");
    expect(seen).toEqual(["a", "b"]);
    off();
    s.stopAudioPreview();
    expect(seen).toEqual(["a", "b"]);
  });
  it("stopAudioPreview pauses, drops the source and goes idle", () => {
    s.playAudioPreview("a", "/a.mp3");
    const el = FakeAudio.all[0];
    s.stopAudioPreview();
    expect(el.pause).toHaveBeenCalled();
    expect(el.removeAttribute).toHaveBeenCalledWith("src");
    expect(el.load).toHaveBeenCalled();
    expect(s.audioPreviewStore.getSnapshot()).toBeNull();
  });
  it("stopAudioPreview before any play is a no-op", () => {
    s.stopAudioPreview();
    expect(FakeAudio.all).toHaveLength(0);
    expect(s.audioPreviewStore.getSnapshot()).toBeNull();
  });
  it("goes idle when the clip ends", () => {
    s.playAudioPreview("a", "/a.mp3");
    FakeAudio.all[0].emit("ended");
    expect(s.audioPreviewStore.getSnapshot()).toBeNull();
  });
  it("goes idle and calls onError when play() is refused", async () => {
    const onError = vi.fn();
    s.playAudioPreview("a", "/a.mp3", onError);
    FakeAudio.all[0].plays[0].reject(new Error("NotAllowedError"));
    await flush();
    expect(s.audioPreviewStore.getSnapshot()).toBeNull();
    expect(onError).toHaveBeenCalledOnce();
  });
  it("goes idle and calls onError on a load error", () => {
    const onError = vi.fn();
    s.playAudioPreview("a", "/a.mp3", onError);
    FakeAudio.all[0].emit("error");
    expect(s.audioPreviewStore.getSnapshot()).toBeNull();
    expect(onError).toHaveBeenCalledOnce();
    FakeAudio.all[0].emit("error");
    expect(onError).toHaveBeenCalledOnce();
  });
  it("ignores a late rejection of a clip that was replaced or stopped", async () => {
    const onA = vi.fn();
    const onB = vi.fn();
    s.playAudioPreview("a", "/a.mp3", onA);
    s.playAudioPreview("b", "/b.mp3", onB);
    const el = FakeAudio.all[0];
    el.plays[0].reject(new DOMException("interrupted", "AbortError"));
    await flush();
    expect(s.audioPreviewStore.getSnapshot()).toBe("b");
    expect(onA).not.toHaveBeenCalled();
    expect(onB).not.toHaveBeenCalled();
    s.stopAudioPreview();
    el.plays[1].reject(new DOMException("interrupted", "AbortError"));
    el.emit("error");
    await flush();
    expect(onB).not.toHaveBeenCalled();
  });
  it("handles play() throwing synchronously", () => {
    s.playAudioPreview("a", "/a.mp3");
    const el = FakeAudio.all[0];
    el.play = () => {
      throw new Error("boom");
    };
    const onError = vi.fn();
    s.playAudioPreview("b", "/b.mp3", onError);
    expect(s.audioPreviewStore.getSnapshot()).toBeNull();
    expect(onError).toHaveBeenCalledOnce();
  });
  it("does nothing where Audio does not exist (server)", async () => {
    vi.unstubAllGlobals();
    vi.stubGlobal("Audio", undefined);
    vi.resetModules();
    const fresh: Store = await import("./audio-preview-store");
    fresh.playAudioPreview("a", "/a.mp3");
    expect(fresh.audioPreviewStore.getSnapshot()).toBeNull();
    expect(fresh.audioPreviewStore.getServerSnapshot()).toBeNull();
    expect(() => fresh.stopAudioPreview()).not.toThrow();
  });
});
