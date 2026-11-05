import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ReactionBar } from "./ReactionBar";

const ITEMS = [
  { key: "THUMBS_UP", label: "Thumbs up", symbol: "+1", count: 2, mine: true },
  { key: "HEART", label: "Heart", symbol: "h", count: 0, mine: false },
];

describe("ReactionBar", () => {
  it("presses what is mine and names each reaction", () => {
    const html = renderToStaticMarkup(<ReactionBar items={ITEMS} onToggle={() => {}} />);
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('aria-label="Thumbs up"');
    expect(html).toContain('aria-label="Heart"');
    expect(html).toContain('type="button"');
  });

  it("shows a count only above zero", () => {
    const html = renderToStaticMarkup(<ReactionBar items={ITEMS} onToggle={() => {}} />);
    expect(html).toContain('<span class="x-reaction-count">2</span>');
    expect(html.match(/x-reaction-count/g)).toHaveLength(1);
  });

  it("calls onToggle with the key of the reaction, from its button", () => {
    const seen: string[] = [];
    const tree = ReactionBar({ items: ITEMS, onToggle: (k) => seen.push(k) });
    const buttons = (tree.props.children as { props: { onClick: () => void } }[]).map((c) => c.props.onClick);
    buttons[1]();
    buttons[0]();
    expect(seen).toEqual(["HEART", "THUMBS_UP"]);
  });

  it("disables every button when disabled", () => {
    const html = renderToStaticMarkup(<ReactionBar items={ITEMS} onToggle={() => {}} disabled />);
    expect(html.match(/disabled=""/g)).toHaveLength(2);
  });

  it("uses no inline colour", () => {
    const html = renderToStaticMarkup(<ReactionBar items={ITEMS} onToggle={() => {}} />);
    expect(html).not.toMatch(/style=|#[0-9a-f]{3,8}\b|rgb\(/i);
  });
});
