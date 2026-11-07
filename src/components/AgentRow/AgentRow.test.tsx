import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useId: () => ":r1:" }));
const { AgentRow } = await import("./AgentRow");

const html = (p: Partial<Parameters<typeof AgentRow>[0]> = {}) =>
  renderToStaticMarkup(<AgentRow name="Claude" cli="claude" summary="Sonnet · work" expanded={false} onToggle={() => {}} {...p}>body</AgentRow>);

describe("AgentRow", () => {
  it("collapsed: summary visible, body hidden, toggle says so", () => {
    const out = html();
    expect(out).toContain("Claude");
    expect(out).toContain("<code");
    expect(out).toContain("Sonnet · work");
    expect(out).toContain('aria-expanded="false"');
    expect(out).toMatch(/<div class="x-agent-row-body"[^>]*hidden/);
    expect(out).not.toContain("data-expanded");
  });

  it("expanded: body shown, state hook set", () => {
    const out = html({ expanded: true });
    expect(out).toContain('aria-expanded="true"');
    expect(out).not.toMatch(/<div class="x-agent-row-body"[^>]*hidden/);
    expect(out).toContain("data-expanded");
  });

  it("the toggle controls the body, which is a named region", () => {
    const out = html();
    expect(out).toContain('aria-controls="x-agent-row-:r1:-body"');
    expect(out).toContain('id="x-agent-row-:r1:-body"');
    expect(out).toContain('role="region"');
    expect(out).toContain('aria-label="Claude settings"');
  });

  it("toggle is a typed button that asks for the opposite state", () => {
    const onToggle = vi.fn();
    const tree = AgentRow({ name: "A", cli: "a", expanded: false, onToggle }) as any;
    const toggle = tree.props.children[0].props.children[0];
    expect(toggle.props.type).toBe("button");
    toggle.props.onClick();
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it("keeps actions outside the toggle button", () => {
    const out = html({ actions: <button type="button">Remove</button> });
    expect(out.indexOf("</button>")).toBeLessThan(out.indexOf("Remove"));
    expect(out).toContain('<div class="x-agent-row-actions">');
  });

  it("omits the summary and actions when absent", () => {
    const out = html({ summary: undefined });
    expect(out).not.toContain("x-agent-row-summary");
    expect(out).not.toContain("x-agent-row-actions");
  });

  it("takes translated labels", () => {
    expect(html({ labels: { details: (n) => `Cài đặt ${n}` } })).toContain('aria-label="Cài đặt Claude"');
  });

  it("uses no inline colour", () => {
    expect(html({ expanded: true })).not.toMatch(/style=|#[0-9a-f]{3,8}\b|rgb\(/i);
  });
});
