import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RunTimeline, type RunTimelineStep } from "./RunTimeline";

const steps: RunTimelineStep[] = [
  { id: "a", label: "Check out", status: "done", at: "14:02", durationMs: 1200 },
  { id: "b", label: "Run agent", status: "running", at: "14:03" },
  { id: "c", label: "Open PR", status: "pending" },
];

describe("RunTimeline", () => {
  it("renders an ordered list named by labels.list", () => {
    const html = renderToStaticMarkup(<RunTimeline steps={steps} />);
    expect(html).toContain("<ol");
    expect(html).toContain('aria-label="Run steps"');
    expect(html.match(/<li /g)).toHaveLength(3);
  });

  it("gives every step a status word, not only a dot", () => {
    const html = renderToStaticMarkup(<RunTimeline steps={steps} />);
    for (const w of ["Done", "Running", "Pending"]) expect(html).toContain(w);
  });

  it("marks only the running step as current", () => {
    const html = renderToStaticMarkup(<RunTimeline steps={steps} />);
    expect(html.match(/aria-current="step"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-current="step"[^>]*data-status="running"|data-status="running"[^>]*aria-current="step"/);
  });

  it("formats duration and shows time", () => {
    const html = renderToStaticMarkup(<RunTimeline steps={steps} />);
    expect(html).toContain("1.2 s");
    expect(html).toContain("14:02");
    expect(renderToStaticMarkup(<RunTimeline steps={[{ id: "x", label: "L", status: "done", durationMs: 184000 }]} />)).toContain("3 min 4 s");
  });

  it("takes translated labels", () => {
    const html = renderToStaticMarkup(<RunTimeline steps={steps} labels={{ list: "Các bước", status: { done: "Xong" }, duration: (ms) => `${ms} ms` }} />);
    expect(html).toContain("Các bước");
    expect(html).toContain("Xong");
    expect(html).toContain("1200 ms");
    expect(html).toContain("Running");
  });

  it("uses no inline colour", () => {
    expect(renderToStaticMarkup(<RunTimeline steps={steps} />)).not.toMatch(/style=|#[0-9a-f]{3,8}\b|rgb\(/i);
  });
});
