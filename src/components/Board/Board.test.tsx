import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Board } from "./Board";
import { BoardColumn } from "../BoardColumn/BoardColumn";

describe("Board", () => {
  it("is a named group of columns", () => {
    const html = renderToStaticMarkup(
      <Board aria-label="Tasks">
        <BoardColumn title="Backlog">x</BoardColumn>
        <BoardColumn title="Done">y</BoardColumn>
      </Board>,
    );
    expect(html).toContain('<div class="x-board" role="group" aria-label="Tasks">');
    expect(html.match(/class="x-board-col"/g)).toHaveLength(2);
  });
});
