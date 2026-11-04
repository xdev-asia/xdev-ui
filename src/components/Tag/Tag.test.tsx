import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Tag } from "./Tag";

describe("Tag", () => {
  it("default tone", () => {
    expect(renderToStaticMarkup(<Tag>x</Tag>)).toBe('<span class="ws-tag">x</span>');
  });
  it("warn tone", () => {
    expect(renderToStaticMarkup(<Tag tone="warn">x</Tag>)).toContain("ws-tag-warn");
  });
});
