import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import type { LaunchValue } from "./LaunchCard";

vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useId: () => "id" }));
const { LaunchCard } = await import("./LaunchCard");

const agents = [{ value: "claude", label: "Claude" }, { value: "codex", label: "Codex" }];
const worktrees = [{ value: "main", label: "main" }, { value: "a", label: "feat/a" }];
const models = [{ value: "opus", label: "Opus" }];
const value: LaunchValue = { agent: "codex", worktree: "a", model: "opus", prompt: "Fix it" };
const base = { agents, worktrees, models, value, onChange: () => {}, onStart: () => {} };

describe("LaunchCard", () => {
  it("renders the agent segments, two labelled selects, the prompt and one primary Start", () => {
    const html = renderToStaticMarkup(<LaunchCard {...base} />);
    expect(html).toContain('aria-label="Start an agent"');
    expect(html).toContain('aria-label="Agent"');
    expect(html).toMatch(/aria-pressed="true"[^>]*>Codex</);
    expect(html.match(/<select/g)).toHaveLength(2);
    expect(html).toContain(">Worktree</label>");
    expect(html).toContain(">Model</label>");
    expect(html).toContain("Fix it</textarea>");
    expect(html).toContain('placeholder="Describe what the agent should do"');
    expect(html.match(/class="btn"/g)).toHaveLength(1);
    expect(html).toContain(">Start<");
  });
  it("shows chips for the chosen worktree and model", () => {
    const html = renderToStaticMarkup(<LaunchCard {...base} />);
    expect(html).toContain('<span class="ws-tag">feat/a</span>');
    expect(html).toContain('<span class="ws-tag">Opus</span>');
  });
  it("renders the closed More options disclosure only with advanced", () => {
    expect(renderToStaticMarkup(<LaunchCard {...base} />)).not.toContain("More options");
    const html = renderToStaticMarkup(<LaunchCard {...base} advanced={<p>flags</p>} />);
    expect(html).toContain("More options");
    expect(html).toContain("flags");
    expect(html).toMatch(/class="ws-group-body"[^>]*hidden/);
  });
  it("onChange gets the whole next value; Start calls onStart", () => {
    const onChange = vi.fn();
    const onStart = vi.fn();
    const tree = LaunchCard({ ...base, onChange, onStart });
    findAll(tree, (e) => e.type === "textarea")[0].props.onChange({ target: { value: "New" } });
    expect(onChange).toHaveBeenLastCalledWith({ ...value, prompt: "New" });
    findAll(tree, (e) => e.props.onChange && e.props.options === worktrees)[0].props.onChange({ target: { value: "main" } });
    expect(onChange).toHaveBeenLastCalledWith({ ...value, worktree: "main" });
    findAll(tree, (e) => e.props.options === agents)[0].props.onChange("claude");
    expect(onChange).toHaveBeenLastCalledWith({ ...value, agent: "claude" });
    findAll(tree, (e) => e.props.variant === "primary")[0].props.onClick();
    expect(onStart).toHaveBeenCalledTimes(1);
  });
  it("labels replace every English default", () => {
    const html = renderToStaticMarkup(
      <LaunchCard
        {...base}
        advanced={<p>x</p>}
        labels={{ region: "§r§", agent: "§a§", worktree: "§w§", model: "§m§", prompt: "§p§", promptPlaceholder: "§h§", more: "§o§", start: "§s§" }}
      />,
    );
    for (const w of ["Start an agent", '"Agent"', ">Worktree<", ">Model<", ">Task<", "Describe what", "More options", ">Start<"]) expect(html).not.toContain(w);
    for (const w of ["§r§", "§a§", "§w§", "§m§", "§p§", "§h§", "§o§", "§s§"]) expect(html).toContain(w);
  });
});
