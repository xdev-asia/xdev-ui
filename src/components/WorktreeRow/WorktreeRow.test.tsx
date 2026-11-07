import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { WorktreeRow } from "./WorktreeRow";

const base = { branch: "feat/a", agents: [{ profile: "claude" as const, title: "Claude Code" }], status: "waiting" as const, onSelect: () => {} };

describe("WorktreeRow", () => {
  it("renders branch, repo, one status dot with text, agent chip and diff", () => {
    const html = renderToStaticMarkup(<WorktreeRow {...base} repo="xdev" diff={{ add: 3, del: 1 }} />);
    expect(html).toContain("feat/a");
    expect(html).toContain("xdev");
    expect(html.match(/ws-dot/g)).toHaveLength(1);
    expect(html).toContain('data-state="waiting"');
    expect(html).toContain('<span class="x-sr-only">Needs you</span>');
    expect(html).toContain('data-profile="claude"');
    expect(html).toContain("+3");
    expect(html).toContain('aria-label="3 added, 1 removed"');
  });
  it("marks the selected row and omits empty parts", () => {
    const html = renderToStaticMarkup(<WorktreeRow {...base} agents={[]} selected />);
    expect(html).toContain('aria-current="true"');
    expect(html).not.toContain("x-worktree-agents");
    expect(html).not.toContain("ws-stat");
  });
  it("renders li when asked", () => {
    expect(renderToStaticMarkup(<WorktreeRow {...base} as="li" />)).toMatch(/^<li /);
  });
  it("labels replace the English defaults", () => {
    const html = renderToStaticMarkup(
      <WorktreeRow {...base} diff={{ add: 1, del: 2 }} labels={{ status: { waiting: "§w§" } as never, diffStat: () => "§d§" }} />,
    );
    expect(html).toContain("§w§");
    expect(html).toContain('aria-label="§d§"');
    expect(html).not.toContain("Needs you");
  });
  it("onSelect fires from the row", () => {
    const onSelect = vi.fn();
    WorktreeRow({ ...base, onSelect }).props.onClick();
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
