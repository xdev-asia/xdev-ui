import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Grid, GridItem } from "./Grid";
import { BREAKPOINTS, atLeast, breakpointFor, responsiveEntries, useBreakpoint } from "./breakpoints";

describe("Grid", () => {
  it("is one column with gap 4 by default", () => {
    expect(renderToStaticMarkup(<Grid>a</Grid>)).toBe('<div class="x-grid" data-gap="4" style="--x-grid-cols:1">a</div>');
  });
  it("sets one variable per breakpoint", () => {
    const html = renderToStaticMarkup(<Grid columns={{ base: 1, md: 2, xl: 4 }}>a</Grid>);
    expect(html).toContain('style="--x-grid-cols:1;--x-grid-cols-md:2;--x-grid-cols-xl:4"');
  });
  it("floors and clamps column counts to at least 1", () => {
    expect(renderToStaticMarkup(<Grid columns={{ sm: 0, lg: 2.7 }}>a</Grid>)).toContain('style="--x-grid-cols-sm:1;--x-grid-cols-lg:2"');
  });
  it("minItemWidth switches to auto-fill and ignores columns", () => {
    const html = renderToStaticMarkup(<Grid minItemWidth="16rem" columns={3}>a</Grid>);
    expect(html).toBe('<div class="x-grid" data-gap="4" data-auto="true" style="--x-grid-min:16rem">a</div>');
  });
  it("container mode wraps the grid in a size container", () => {
    const html = renderToStaticMarkup(<Grid responsive="container" columns={{ md: 2 }} as="ul">a</Grid>);
    expect(html).toBe('<div class="x-grid-scope"><ul class="x-grid" data-gap="4" data-scope="container" style="--x-grid-cols-md:2">a</ul></div>');
  });
  it("keeps the caller's style", () => {
    expect(renderToStaticMarkup(<Grid style={{ marginTop: 8 }}>a</Grid>)).toContain('style="--x-grid-cols:1;margin-top:8px"');
  });
});

describe("GridItem", () => {
  it("spans per breakpoint", () => {
    expect(renderToStaticMarkup(<GridItem span={{ base: 1, lg: 2 }}>a</GridItem>)).toBe(
      '<div class="x-grid-item" style="--x-span:1;--x-span-lg:2">a</div>',
    );
  });
  it("full spans the row", () => {
    expect(renderToStaticMarkup(<GridItem span="full">a</GridItem>)).toBe('<div class="x-grid-item" data-full="true">a</div>');
  });
});

describe("breakpoints", () => {
  it("match tokens.json", () => {
    const tokens = JSON.parse(readFileSync(resolve(__dirname, "../../../tokens/tokens.json"), "utf8"));
    const fromTokens = Object.fromEntries((tokens.breakpoint.tokens as { name: string; value: string }[]).map((t) => [t.name.slice(5), parseFloat(t.value)]));
    expect(fromTokens).toEqual(BREAKPOINTS);
  });
  it("breakpointFor picks the largest min-width that fits", () => {
    expect(breakpointFor(0)).toBe("base");
    expect(breakpointFor(639)).toBe("base");
    expect(breakpointFor(640)).toBe("sm");
    expect(breakpointFor(1023)).toBe("md");
    expect(breakpointFor(4000)).toBe("2xl");
  });
  it("atLeast compares breakpoints", () => {
    expect(atLeast("base", "sm")).toBe(false);
    expect(atLeast("lg", "md")).toBe(true);
    expect(atLeast("md", "lg")).toBe(false);
  });
  it("responsiveEntries orders keys and treats a number as base", () => {
    expect(responsiveEntries(3)).toEqual([["base", 3]]);
    expect(responsiveEntries({ xl: 4, base: 1 })).toEqual([["base", 1], ["xl", 4]]);
    expect(responsiveEntries(undefined)).toEqual([]);
  });
  it("useBreakpoint renders base on the server", () => {
    function Probe() {
      return <span>{useBreakpoint()}</span>;
    }
    expect(renderToStaticMarkup(<Probe />)).toBe("<span>base</span>");
  });
});
