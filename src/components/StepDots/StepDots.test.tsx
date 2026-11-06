import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StepDots } from "./StepDots";

describe("StepDots", () => {
  it("renders one dot per step and marks the current one", () => {
    const html = renderToStaticMarkup(<StepDots total={3} current={2} />);
    expect(html.match(/class="x-step-dot"/g)).toHaveLength(3);
    expect(html.match(/data-current="true"/g)).toHaveLength(1);
    expect(html).toMatch(/data-done="true"[^>]*><\/span><span class="x-step-dot" data-current="true"/);
  });
  it("is one image named by the step", () => {
    const html = renderToStaticMarkup(<StepDots total={3} current={2} />);
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Step 2 of 3"');
    expect(renderToStaticMarkup(<StepDots total={3} current={1} labels={{ step: (c, t) => `Bước ${c} / ${t}` }} />)).toContain('aria-label="Bước 1 / 3"');
  });
  it("clamps the current step into range", () => {
    expect(renderToStaticMarkup(<StepDots total={2} current={5} />)).toContain('aria-label="Step 2 of 2"');
    expect(renderToStaticMarkup(<StepDots total={2} current={0} />)).toContain('aria-label="Step 1 of 2"');
  });
});
