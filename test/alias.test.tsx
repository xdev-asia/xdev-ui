import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "@xdev-asia/ui";

describe("package aliases", () => {
  it("resolves @xdev-asia/ui to the source", () => {
    expect(renderToStaticMarkup(<Button>Save</Button>)).toContain("Save");
  });
});
