import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { IconButton } from "../IconButton/IconButton";
import { Pagination } from "./Pagination";

const noop = () => {};

describe("Pagination", () => {
  it("is a named nav with the range text", () => {
    const html = renderToStaticMarkup(<Pagination page={1} pageSize={20} total={57} onPageChange={noop} />);
    expect(html).toContain('<nav class="x-pagination" aria-label="Pagination">');
    expect(html).toContain("1–20 of 57");
  });
  it("shows the last partial page", () => {
    expect(renderToStaticMarkup(<Pagination page={3} pageSize={20} total={57} onPageChange={noop} />)).toContain("41–57 of 57");
  });
  it("shows 0 of 0 when empty", () => {
    expect(renderToStaticMarkup(<Pagination page={1} pageSize={20} total={0} onPageChange={noop} />)).toContain("0 of 0");
  });
  it("disables previous on the first page and next on the last", () => {
    const first = findAll(Pagination({ page: 1, pageSize: 20, total: 57, onPageChange: noop }), (e) => e.type === IconButton);
    expect(first[0].props.disabled).toBe(true);
    expect(first[1].props.disabled).toBe(false);
    const last = findAll(Pagination({ page: 3, pageSize: 20, total: 57, onPageChange: noop }), (e) => e.type === IconButton);
    expect(last[0].props.disabled).toBe(false);
    expect(last[1].props.disabled).toBe(true);
    const only = findAll(Pagination({ page: 1, pageSize: 20, total: 5, onPageChange: noop }), (e) => e.type === IconButton);
    expect(only.every((b) => b.props.disabled)).toBe(true);
  });
  it("calls onPageChange with the neighbouring page", () => {
    const onPageChange = vi.fn();
    const [prev, next] = findAll(Pagination({ page: 2, pageSize: 20, total: 57, onPageChange }), (e) => e.type === IconButton);
    prev.props.onClick();
    next.props.onClick();
    expect(onPageChange.mock.calls).toEqual([[1], [3]]);
  });
  it("renders the page-size select only with options", () => {
    expect(renderToStaticMarkup(<Pagination page={1} pageSize={20} total={57} onPageChange={noop} />)).not.toContain("<select");
    const html = renderToStaticMarkup(<Pagination page={1} pageSize={20} total={57} onPageChange={noop} pageSizeOptions={[10, 20, 50]} onPageSizeChange={noop} />);
    expect(html).toContain("<select");
    expect(html).toContain('aria-label="Rows per page"');
    expect(html).toContain('<option value="20" selected="">20</option>');
  });
});
