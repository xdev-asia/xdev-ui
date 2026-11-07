import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useState: (v: unknown) => [v, () => {}] }));
const { AttentionInbox, sortByWait } = await import("./AttentionInbox");
import type { AttentionItem } from "./AttentionInbox";

const NOW = 1_000_000_000;
const items: AttentionItem[] = [
  { id: "new", agent: "codex", worktree: "fix/b", text: "Pick one", since: NOW - 60_000, kind: "question" },
  { id: "old", agent: "claude", worktree: "feat/a", text: "Run tests?", since: NOW - 600_000, kind: "approval" },
  { id: "bad", agent: "claude", worktree: "chore/c", text: "Build failed", since: new Date(NOW - 300_000), kind: "failed" },
];

describe("AttentionInbox", () => {
  it("shows the count on the button and announces it", () => {
    const html = renderToStaticMarkup(<AttentionInbox items={items} onOpen={() => {}} now={NOW} />);
    expect(html).toContain('aria-label="Needs you, 3"');
    expect(html).toContain('class="x-attention-count"');
    expect(html).toContain('role="status"');
    expect(html).not.toContain("x-attention-list");
  });
  it("hides the badge at 0 and caps at 99+", () => {
    expect(renderToStaticMarkup(<AttentionInbox items={[]} onOpen={() => {}} />)).not.toContain("x-attention-count");
    const many = Array.from({ length: 120 }, (_, i): AttentionItem => ({ ...items[0], id: String(i) }));
    expect(renderToStaticMarkup(<AttentionInbox items={many} onOpen={() => {}} />)).toContain("99+");
  });
  it("lists the oldest wait first with kind text and wait time", () => {
    const html = renderToStaticMarkup(<AttentionInbox items={items} onOpen={() => {}} now={NOW} open />);
    expect(html.indexOf("feat/a")).toBeLessThan(html.indexOf("chore/c"));
    expect(html.indexOf("chore/c")).toBeLessThan(html.indexOf("fix/b"));
    expect(html).toContain("10 min");
    expect(html).toContain(">Approval<");
    expect(html).toContain(">Failed<");
    expect(html).toContain('aria-label="Open feat/a"');
  });
  it("shows the empty text", () => {
    expect(renderToStaticMarkup(<AttentionInbox items={[]} onOpen={() => {}} open />)).toContain("Nothing is waiting for you.");
  });
  it("labels replace every English string", () => {
    const html = renderToStaticMarkup(
      <AttentionInbox
        items={items}
        onOpen={() => {}}
        now={NOW}
        open
        labels={{ title: "§t§", button: (n) => `§b${n}§`, open: "§o§", openItem: () => "§oi§", kind: { approval: "§a§", question: "§q§", failed: "§f§" }, waited: () => "§w§" }}
      />,
    );
    const text = html.replace(/<[^>]*>/g, " ");
    for (const w of ["Needs you", "Open", "Approval", "Question", "Failed", "min"]) expect(text).not.toContain(w);
    expect(html).toContain("§b3§");
  });
  it("onOpen gets the item id", () => {
    const onOpen = vi.fn();
    const rows = findAll(AttentionInbox({ items, onOpen, now: NOW, open: true }), (e) => e.props["aria-label"] === "Open feat/a");
    expect(rows).toHaveLength(1);
    rows[0].props.onClick();
    expect(onOpen).toHaveBeenCalledWith("old");
  });
  it("sortByWait puts unparsable times last", () => {
    const sorted = sortByWait([{ ...items[0], id: "x", since: "nope" }, ...items]);
    expect(sorted.map((i) => i.id)).toEqual(["old", "bad", "new", "x"]);
  });
});
