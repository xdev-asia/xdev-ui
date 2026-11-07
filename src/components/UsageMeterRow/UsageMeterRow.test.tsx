import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { UsageMeterRow } from "./UsageMeterRow";

const windows = [
  { label: "5 h", used: 42, resetText: "Resets in 2 h" },
  { label: "Week", used: 88, resetText: "Resets on Mon" },
];

describe("UsageMeterRow", () => {
  it("renders the account, state word, one meter per window and the reset text", () => {
    const html = renderToStaticMarkup(<UsageMeterRow account="claude-3" state="ok" windows={windows} />);
    expect(html).toContain("claude-3");
    expect(html).toContain('data-state="ok"');
    expect(html).toContain(">Active<");
    expect(html.match(/role="meter"/g)).toHaveLength(2);
    expect(html).toContain("Resets in 2 h");
    expect(html).toContain("Resets on Mon");
  });
  it("warns at or above warnAt (default 80) and not below", () => {
    const html = renderToStaticMarkup(<UsageMeterRow account="a" state="ok" windows={windows} />);
    expect(html.match(/data-warn=""/g)).toHaveLength(1);
    expect(html.indexOf('data-warn=""')).toBeGreaterThan(html.indexOf('aria-valuenow="42"'));
    const custom = renderToStaticMarkup(<UsageMeterRow account="a" state="ok" windows={windows} warnAt={40} />);
    expect(custom.match(/data-warn=""/g)).toHaveLength(2);
    const exact = renderToStaticMarkup(<UsageMeterRow account="a" state="ok" windows={[{ label: "x", used: 80, resetText: "r" }]} />);
    expect(exact).toContain('data-warn=""');
  });
  it("maps states to a tone and word", () => {
    const tone = (s: "ok" | "limited" | "error" | "signedOut") => renderToStaticMarkup(<UsageMeterRow account="a" state={s} windows={[]} />);
    expect(tone("limited")).toContain('data-tone="warn"');
    expect(tone("limited")).toContain("Limit reached");
    expect(tone("error")).toContain('data-tone="danger"');
    expect(tone("signedOut")).toContain('data-tone="neutral"');
    expect(tone("signedOut")).toContain("Signed out");
  });
  it("omits the window list and actions when empty or not given, and renders actions", () => {
    const bare = renderToStaticMarkup(<UsageMeterRow account="a" state="ok" windows={[]} />);
    expect(bare).not.toContain("x-usage-windows");
    expect(bare).not.toContain("x-usage-actions");
    const withActions = renderToStaticMarkup(<UsageMeterRow account="a" state="ok" windows={[]} actions={<button type="button">Sign in</button>} />);
    expect(withActions).toContain('class="x-usage-actions"');
  });
  it("labels replace every English state word", () => {
    const state = { ok: "§o§", limited: "§l§", error: "§e§", signedOut: "§s§" };
    expect(renderToStaticMarkup(<UsageMeterRow account="a" state="ok" windows={[]} labels={{ state }} />)).toContain("§o§");
    const html = renderToStaticMarkup(<UsageMeterRow account="a" state="limited" windows={[]} labels={{ state }} />);
    expect(html).toContain("§l§");
    expect(html).not.toContain("Limit reached");
  });
});
