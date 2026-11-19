import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";

const h = vi.hoisted(() => ({ client: false }));
vi.mock("react", async (orig) => {
  const React = await orig<typeof import("react")>();
  return {
    ...React,
    // renderToStaticMarkup always reads the server snapshot; `client` switches to the live one to render the playing state.
    useSyncExternalStore: <T,>(sub: (cb: () => void) => () => void, get: () => T, server?: () => T): T =>
      h.client ? get() : React.useSyncExternalStore(sub, get, server),
  };
});

class FakeAudio {
  preload = "";
  src = "";
  pause = vi.fn();
  load = vi.fn();
  removeAttribute = vi.fn();
  addEventListener() {}
  play = vi.fn(() => new Promise<void>(() => {}));
}

const { AudioPreview, useAudioPreview } = await import("./AudioPreview");
const { audioPreviewStore, playAudioPreview, stopAudioPreview } = await import("./audio-preview-store");

beforeAll(() => vi.stubGlobal("Audio", FakeAudio));
afterEach(() => {
  stopAudioPreview();
  h.client = false;
});

describe("AudioPreview markup", () => {
  it("server-renders idle: a small round play button named by labels.play", () => {
    playAudioPreview("/a.mp3", "/a.mp3");
    const html = renderToStaticMarkup(<AudioPreview src="/a.mp3" />);
    // the server snapshot is null even while a clip plays in this module
    expect(html).toMatch(/^<button type="button" class="ws-icon-btn x-audio-preview" aria-label="Play preview" title="Play preview" data-size="sm" aria-pressed="false"><svg[^]*<\/svg><\/button>$/);
    expect(html).toContain("<svg");
  });
  it("renders the stop state with aria-pressed when its clip plays", () => {
    h.client = true;
    playAudioPreview("/a.mp3", "/a.mp3");
    const html = renderToStaticMarkup(<AudioPreview src="/a.mp3" />);
    expect(html).toContain('aria-label="Stop preview" title="Stop preview"');
    expect(html).toContain('aria-pressed="true"');
    const other = renderToStaticMarkup(<AudioPreview src="/b.mp3" />);
    expect(other).toContain('aria-pressed="false"');
  });
  it("uses id, not src, as the identity of the clip", () => {
    h.client = true;
    playAudioPreview("row-2", "/same.mp3");
    expect(renderToStaticMarkup(<AudioPreview src="/same.mp3" id="row-1" />)).toContain('aria-pressed="false"');
    expect(renderToStaticMarkup(<AudioPreview src="/same.mp3" id="row-2" />)).toContain('aria-pressed="true"');
  });
  it("md size, disabled and className", () => {
    const html = renderToStaticMarkup(<AudioPreview src="/a.mp3" size="md" disabled className="row-play" />);
    expect(html).not.toContain("data-size");
    expect(html).toContain('class="ws-icon-btn x-audio-preview row-play"');
    expect(html).toContain('disabled=""');
  });
  it("with a label renders a secondary Button whose text stays the name", () => {
    const html = renderToStaticMarkup(<AudioPreview src="/a.mp3" label="Listen" />);
    expect(html).toMatch(/^<button type="button" class="btn-secondary x-audio-preview" data-size="sm" title="Play preview" aria-pressed="false"><svg/);
    expect(html).toContain("</svg>Listen</button>");
    expect(html).not.toContain("aria-label");
    h.client = true;
    playAudioPreview("/a.mp3", "/a.mp3");
    expect(renderToStaticMarkup(<AudioPreview src="/a.mp3" label="Listen" size="md" />)).toMatch(/class="btn-secondary x-audio-preview" title="Stop preview" aria-pressed="true"/);
  });
  it("labels override the defaults", () => {
    const html = renderToStaticMarkup(<AudioPreview src="/a.mp3" labels={{ play: "Nghe thử" }} />);
    expect(html).toContain('aria-label="Nghe thử"');
  });
});

describe("AudioPreview behaviour", () => {
  it("click plays its clip, then stops it", () => {
    h.client = true;
    const onError = vi.fn();
    const idle = AudioPreview({ src: "/a.mp3", id: "a", onError });
    expect(idle.type).toBe(IconButton);
    idle.props.onClick();
    expect(audioPreviewStore.getSnapshot()).toBe("a");
    const on = AudioPreview({ src: "/a.mp3", id: "a" });
    expect(on.props.icon).toBe("stop");
    on.props.onClick();
    expect(audioPreviewStore.getSnapshot()).toBeNull();
  });
  it("clicking another clip switches to it", () => {
    h.client = true;
    AudioPreview({ src: "/a.mp3" }).props.onClick();
    const b = AudioPreview({ src: "/b.mp3", label: "B" });
    expect(b.type).toBe(Button);
    b.props.onClick();
    expect(audioPreviewStore.getSnapshot()).toBe("/b.mp3");
  });
  it("useAudioPreview exposes the playing id, play and stop", () => {
    h.client = true;
    const c = useAudioPreview();
    expect(c.playingId).toBeNull();
    c.play("x", "/x.mp3");
    expect(useAudioPreview().playingId).toBe("x");
    c.stop();
    expect(useAudioPreview().playingId).toBeNull();
  });
});
