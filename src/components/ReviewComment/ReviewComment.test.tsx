import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { findAll } from "../../test-utils";
import { ReviewComment } from "./ReviewComment";

describe("ReviewComment", () => {
  it("shows author, time, body and the line reference", () => {
    const html = renderToStaticMarkup(<ReviewComment line={42} author="maya" time="2h ago" body="Cap it." />);
    expect(html).toContain("maya");
    expect(html).toContain("2h ago");
    expect(html).toContain("Cap it.");
    expect(html).toContain("Line 42");
    expect(html).toContain("x-comment");
  });

  it("puts the file before the line", () => {
    expect(renderToStaticMarkup(<ReviewComment line="40-44" file="a.ts" author="m" body="x" />)).toContain("a.ts · Line 40-44");
  });

  it("renders a suggestion as escaped text", () => {
    const html = renderToStaticMarkup(<ReviewComment line={1} author="m" body="x" suggestion={"<b>if</b> (a && b)"} />);
    expect(html).toContain("Suggested change");
    expect(html).toContain("&lt;b&gt;if&lt;/b&gt; (a &amp;&amp; b)");
    expect(html).not.toContain("<b>");
  });

  it("omits the suggestion block without one", () => {
    expect(renderToStaticMarkup(<ReviewComment line={1} author="m" body="x" />)).not.toContain("x-review-suggestion");
  });

  it("shows Resolve only with onResolve, as a typed secondary button", () => {
    expect(renderToStaticMarkup(<ReviewComment line={1} author="m" body="x" />)).not.toContain("Resolve");
    const html = renderToStaticMarkup(<ReviewComment line={1} author="m" body="x" onResolve={() => {}} />);
    expect(html).toContain("Resolve");
    expect(html).toContain('type="button"');
    expect(html).toContain("btn-secondary");
    expect(html).not.toContain("data-state");
  });

  it("a resolved thread is tinted, badged and offers Reopen", () => {
    const html = renderToStaticMarkup(<ReviewComment line={1} author="m" body="x" resolved onResolve={() => {}} onReopen={() => {}} />);
    expect(html).toContain('data-state="resolved"');
    expect(html).toContain(">Resolved<");
    expect(html).toContain("Reopen");
    expect(html).not.toContain(">Resolve<");
  });

  it("takes translated labels", () => {
    const html = renderToStaticMarkup(
      <ReviewComment
        line={7}
        author="m"
        body="x"
        suggestion="y"
        resolved
        onReopen={() => {}}
        labels={{ line: (n) => `Dòng ${n}`, suggestion: "Đề xuất", reopen: "Mở lại", resolved: "Đã xử lý" }}
      />,
    );
    for (const w of ["Dòng 7", "Đề xuất", "Mở lại", "Đã xử lý"]) expect(html).toContain(w);
    expect(html).not.toMatch(/Suggested change|Reopen|Line 7/);
  });

  it("uses no inline colour", () => {
    expect(renderToStaticMarkup(<ReviewComment line={1} author="m" body="x" suggestion="y" onResolve={() => {}} />)).not.toMatch(/style=|#[0-9a-f]{3,8}\b|rgb\(/i);
  });

  it("accepts children as the body, and both together", () => {
    const html = renderToStaticMarkup(<ReviewComment line={1} author="m"><b>nested</b></ReviewComment>);
    expect(html).toContain("<b>nested</b>");
    const both = renderToStaticMarkup(<ReviewComment line={1} author="m" body="first"><i>second</i></ReviewComment>);
    expect(both.indexOf("first")).toBeLessThan(both.indexOf("<i>second</i>"));
  });

  it("exposes nested children to a shallow tree walk", () => {
    const tree = ReviewComment({ line: 1, author: "m", children: <button type="button">Open</button> });
    expect(findAll(tree, (e) => e.type === "button").length).toBe(1);
  });
});
