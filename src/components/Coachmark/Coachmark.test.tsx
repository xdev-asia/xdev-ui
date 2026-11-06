import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Coachmark } from "./Coachmark";
import { COACHMARK_GAP, COACHMARK_MARGIN, placeCoachmark } from "./placeCoachmark";

const card = { width: 320, height: 160 };
const desktop = { width: 1280, height: 800 };

describe("placeCoachmark", () => {
  it("puts the card below the anchor when it fits, centred, arrow on the anchor", () => {
    const pos = placeCoachmark({ top: 100, left: 400, width: 40, height: 20 }, card, desktop);
    expect(pos).toEqual({ top: 100 + 20 + COACHMARK_GAP, left: 420 - 160, placement: "bottom", arrow: 160 });
  });
  it("flips to the top at the viewport bottom", () => {
    const pos = placeCoachmark({ top: 770, left: 400, width: 120, height: 22 }, card, desktop);
    expect(pos?.placement).toBe("top");
    expect(pos?.top).toBe(770 - COACHMARK_GAP - 160);
  });
  it("keeps the preferred side when neither side fits, clamped into the viewport", () => {
    const pos = placeCoachmark({ top: 100, left: 400, width: 40, height: 600 }, card, desktop);
    expect(pos?.placement).toBe("bottom");
    expect(pos?.top).toBe(800 - COACHMARK_MARGIN - 160);
  });
  it("clamps to the start at 360px and keeps the arrow on the anchor", () => {
    const pos = placeCoachmark({ top: 40, left: 4, width: 28, height: 28 }, card, { width: 360, height: 740 });
    expect(pos?.left).toBe(COACHMARK_MARGIN);
    expect(pos?.arrow).toBe(16);
    expect(pos!.left + card.width).toBeLessThanOrEqual(360 - COACHMARK_MARGIN);
  });
  it("clamps to the end and keeps the arrow off the corner", () => {
    const pos = placeCoachmark({ top: 40, left: 1260, width: 16, height: 16 }, card, desktop);
    expect(pos?.left).toBe(1280 - COACHMARK_MARGIN - 320);
    expect(pos?.arrow).toBe(320 - 16);
  });
  it("flips end to start and centres on the anchor vertically", () => {
    const pos = placeCoachmark({ top: 300, left: 1100, width: 40, height: 40 }, card, desktop, "end");
    expect(pos).toMatchObject({ placement: "start", left: 1100 - COACHMARK_GAP - 320, top: 240, arrow: 80 });
  });
  it("gives null for a missing or hidden anchor", () => {
    expect(placeCoachmark(null, card, desktop)).toBeNull();
    expect(placeCoachmark({ top: 0, left: 0, width: 0, height: 0 }, card, desktop)).toBeNull();
  });
});

const anchor = { top: 100, left: 400, width: 40, height: 20 };
const noop = () => {};

describe("Coachmark", () => {
  it("renders the title, body, dots and a named dialog", () => {
    const html = renderToStaticMarkup(
      <Coachmark anchor={anchor} title="New agent" step={1} total={3} onNext={noop} onSkip={noop} onBack={noop}>
        Start a task here.
      </Coachmark>,
    );
    expect(html).toContain('role="dialog"');
    expect(html).toMatch(/aria-labelledby="([^"]+)"[\s\S]*id="\1"/);
    expect(html).toContain("New agent");
    expect(html).toContain("Start a task here.");
    expect(html).toContain('aria-label="Step 1 of 3"');
    expect(html).toContain('data-placement="bottom"');
    expect(html).toContain("--coachmark-arrow:");
  });
  it("hides Back at step 1 and shows it later", () => {
    const first = renderToStaticMarkup(<Coachmark anchor={anchor} title="T" step={1} total={3} onBack={noop} onNext={noop} onSkip={noop} />);
    expect(first).not.toContain(">Back<");
    expect(first).toContain(">Skip tour<");
    expect(first).toContain(">Next<");
    const second = renderToStaticMarkup(<Coachmark anchor={anchor} title="T" step={2} total={3} onBack={noop} onNext={noop} onSkip={noop} />);
    expect(second).toContain(">Back<");
  });
  it("says Done on the last step, with one primary button", () => {
    const html = renderToStaticMarkup(<Coachmark anchor={anchor} title="T" step={3} total={3} onBack={noop} onNext={noop} onSkip={noop} />);
    expect(html).toContain(">Done<");
    expect(html).not.toContain(">Next<");
    expect(html.match(/class="btn /g)).toHaveLength(1);
  });
  it("renders nothing without an anchor", () => {
    expect(renderToStaticMarkup(<Coachmark anchor={null} title="T" step={1} total={3} onNext={noop} onSkip={noop} />)).toBe("");
  });
});
