import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useId: () => ":b1:" }));
const { BoardColumn } = await import("./BoardColumn");
const { BoardCard } = await import("../BoardCard/BoardCard");

describe("BoardColumn", () => {
  it("renders the head with count badge and a list body of listitems", () => {
    const html = renderToStaticMarkup(
      <BoardColumn title="In progress" count={2} actions={<button type="button">New task</button>}>
        <BoardCard title="A" />
        <BoardCard title="B" />
      </BoardColumn>,
    );
    expect(html).toContain('<section class="x-board-col" aria-labelledby="x-board-col-:b1:">');
    expect(html).toContain('<h3 class="x-board-col-title" id="x-board-col-:b1:">In progress</h3>');
    expect(html).toContain('<span class="badge">2</span>');
    expect(html).toContain('<div class="x-board-col-actions"><button type="button">New task</button></div>');
    expect(html).toContain('<div class="x-board-col-body" role="list" aria-label="In progress">');
    expect(html.match(/role="listitem"/g)).toHaveLength(2);
  });
  it("shows a zero count, skips an absent one, and honours aria-label", () => {
    expect(renderToStaticMarkup(<BoardColumn title="Done" count={0}>x</BoardColumn>)).toContain('<span class="badge">0</span>');
    const html = renderToStaticMarkup(<BoardColumn title="Done" aria-label="Done tasks">x</BoardColumn>);
    expect(html).not.toContain("badge");
    expect(html).toContain('aria-label="Done tasks"');
  });
  it("dropTarget sets the modifier", () => {
    expect(renderToStaticMarkup(<BoardColumn title="T" dropTarget>x</BoardColumn>)).toContain('data-drop-target=""');
    expect(renderToStaticMarkup(<BoardColumn title="T">x</BoardColumn>)).not.toContain("data-drop-target");
  });
  it("onAdd shows a named plus button after the actions", () => {
    const onAdd = vi.fn();
    const html = renderToStaticMarkup(<BoardColumn title="T" onAdd={onAdd} actions={<span>a</span>}>x</BoardColumn>);
    expect(html).toContain('aria-label="Add card"');
    expect(html.indexOf("<span>a</span>")).toBeLessThan(html.indexOf("Add card"));
    expect(renderToStaticMarkup(<BoardColumn title="T" onAdd={onAdd} labels={{ add: "Thêm thẻ" }}>x</BoardColumn>)).toContain('aria-label="Thêm thẻ"');
  });
  it("renders no add button and no actions wrapper without onAdd or actions", () => {
    const html = renderToStaticMarkup(<BoardColumn title="T">x</BoardColumn>);
    expect(html).not.toContain("x-board-col-actions");
    expect(html).not.toContain("Add card");
  });
});
