import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { Button } from "../Button/Button";
import { BulkBar } from "./BulkBar";

describe("BulkBar", () => {
  it("renders nothing while nothing is selected", () => {
    expect(renderToStaticMarkup(<BulkBar count={0} onClear={() => {}} />)).toBe("");
    expect(BulkBar({ count: -1, onClear: () => {} })).toBeNull();
  });
  it("is a named region with the count, the actions and a clear button", () => {
    const html = renderToStaticMarkup(
      <BulkBar count={3} onClear={() => {}}>
        <Button variant="secondary">Suspend</Button>
      </BulkBar>,
    );
    expect(html).toContain('class="x-bulk-bar" role="region" aria-label="Bulk actions"');
    expect(html).toContain('<span class="x-bulk-count" aria-live="polite">3 selected</span>');
    expect(html).toContain('<div class="x-bulk-actions"><button type="button" class="btn-secondary">Suspend</button></div>');
    expect(html).toContain("Clear selection");
    expect(renderToStaticMarkup(<BulkBar count={1} onClear={() => {}} />)).not.toContain("x-bulk-actions");
  });
  it("clear calls onClear", () => {
    const onClear = vi.fn();
    const btn = findAll(BulkBar({ count: 2, onClear }), (e) => e.props.className === "x-bulk-clear")[0];
    btn.props.onClick();
    expect(onClear).toHaveBeenCalledOnce();
  });
  it("labels override the defaults", () => {
    const html = renderToStaticMarkup(<BulkBar count={2} onClear={() => {}} className="mine" labels={{ region: "Thao tác hàng loạt", selected: (n) => `Đã chọn ${n}`, clear: "Bỏ chọn" }} />);
    expect(html).toContain('class="x-bulk-bar mine"');
    for (const s of ["Thao tác hàng loạt", "Đã chọn 2", "Bỏ chọn"]) expect(html).toContain(s);
  });
});
