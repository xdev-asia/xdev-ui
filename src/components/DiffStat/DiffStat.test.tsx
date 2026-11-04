import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { DiffStat } from "./DiffStat";

it("renders counts with default labels", () => {
  const html = renderToStaticMarkup(<DiffStat added={3} removed={1} />);
  expect(html).toContain("+3");
  expect(html).toContain("−1");
  expect(html).toContain('aria-label="3 added, 1 removed"');
});
