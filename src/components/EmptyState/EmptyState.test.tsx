import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders a centered view with an icon tile", () => {
    const html = renderToStaticMarkup(
      <EmptyState
        size="center"
        icon="branch"
        title="No worktrees yet"
        hint="Create one per task."
        actions={<button type="button">New worktree</button>}
      />,
    );
    expect(html).toContain('<div class="x-empty" data-size="center"><span class="x-empty-icon"><svg');
    expect(html).toContain('<p class="x-empty-title">No worktrees yet</p>');
    expect(html).toContain('<p class="x-empty-hint">Create one per task.</p>');
    expect(html).toContain('<div class="x-empty-actions">');
  });
  it("inline size drops the icon", () => {
    const html = renderToStaticMarkup(<EmptyState icon="branch" title="No changes" />);
    expect(html).toContain('data-size="inline"');
    expect(html).not.toContain("x-empty-icon");
  });
  describe("steps", () => {
    const steps = [{ label: "Open a project", done: true }, { label: "Pick an agent" }, { label: "Start a session" }];
    it("renders step dots and a numbered list, current = first step not done", () => {
      const html = renderToStaticMarkup(<EmptyState size="center" title="Welcome" steps={steps} />);
      expect(html).toContain('aria-label="Step 2 of 3"');
      expect(html).toContain("<ol");
      expect(html.match(/<li /g)).toHaveLength(3);
      expect(html.match(/aria-current="step"/g)).toHaveLength(1);
      const current = html.slice(html.indexOf('aria-current="step"'));
      expect(current.slice(0, current.indexOf("</li>"))).toContain("Pick an agent");
    });
    it("a finished step has a check and a text, not colour alone", () => {
      const html = renderToStaticMarkup(<EmptyState title="W" steps={steps} />);
      expect(html.match(/<li [^>]*data-done/g)).toHaveLength(1);
      expect(html).toContain(">Done<");
    });
    it("current is 1-based and clamped", () => {
      expect(renderToStaticMarkup(<EmptyState title="W" steps={steps} current={3} />)).toContain("Step 3 of 3");
      expect(renderToStaticMarkup(<EmptyState title="W" steps={steps} current={9} />)).toContain("Step 3 of 3");
      expect(renderToStaticMarkup(<EmptyState title="W" steps={[{ label: "a", done: true }]} />)).toContain("Step 1 of 1");
    });
    it("places steps between the hint and the actions", () => {
      const html = renderToStaticMarkup(<EmptyState title="W" hint="H" steps={steps} actions={<button type="button">Go</button>} />);
      expect(html.indexOf("x-empty-hint")).toBeLessThan(html.indexOf("x-empty-steps"));
      expect(html.indexOf("x-empty-steps")).toBeLessThan(html.indexOf("x-empty-actions"));
    });
    it("renders nothing extra without steps or with an empty list", () => {
      expect(renderToStaticMarkup(<EmptyState title="W" />)).not.toContain("x-step-dots");
      expect(renderToStaticMarkup(<EmptyState title="W" steps={[]} />)).not.toContain("x-empty-steps");
    });
    it("takes translated labels", () => {
      const html = renderToStaticMarkup(<EmptyState title="W" steps={steps} labels={{ done: "Xong", steps: "Các bước", step: (c, t) => `Bước ${c}/${t}` }} />);
      for (const w of ["Xong", "Các bước", "Bước 2/3"]) expect(html).toContain(w);
      expect(html).not.toMatch(/>Done<|Step 2/);
    });
  });
});
