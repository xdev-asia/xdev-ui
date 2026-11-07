import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SessionBar } from "./SessionBar";

describe("SessionBar", () => {
  it("shows state word with dot, model, elapsed and diff", () => {
    const html = renderToStaticMarkup(<SessionBar status="working" model="m-1" elapsed={125_000} diff={{ add: 2, del: 1 }} actions={<button type="button">Stop</button>} />);
    expect(html).toContain('role="group"');
    expect(html).toContain('data-state="working"');
    expect(html).toContain("ws-pulse");
    expect(html).toContain(">Working<");
    expect(html).toContain('aria-label="Model: m-1"');
    expect(html).toContain("2 min");
    expect(html).toContain('aria-label="2 added, 1 removed"');
    expect(html).toContain("x-sessionbar-actions");
  });
  it("omits parts that are not given and does not pulse when idle", () => {
    const html = renderToStaticMarkup(<SessionBar status="idle" />);
    expect(html).not.toContain("x-sessionbar-item");
    expect(html).not.toContain("ws-stat");
    expect(html).not.toContain("x-sessionbar-actions");
    expect(html).not.toContain("ws-pulse");
  });
  it("labels replace every English default", () => {
    const html = renderToStaticMarkup(
      <SessionBar
        status="waiting"
        model="m"
        elapsed={1000}
        diff={{ add: 1, del: 1 }}
        labels={{ region: "§r§", status: { waiting: "§w§" } as never, model: "§m§", elapsed: "§e§", duration: () => "§d§", diffStat: () => "§s§" }}
      />,
    );
    const text = html.replace(/<[^>]*>/g, " ") + [...html.matchAll(/aria-label="([^"]*)"/g)].map((m) => m[1]).join(" ");
    for (const w of ["Session", "Needs you", "Model", "Elapsed", "added"]) expect(text).not.toContain(w);
    expect(html).toContain("§w§");
  });
});
