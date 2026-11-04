import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders a centered view with an icon tile", () => {
    const html = renderToStaticMarkup(
      <EmptyState
        size="center"
        icon="branch"
        title="No worktrees yet"
        hint="Create one per task."
        actions={<button type="button">New worktree</button>}
      />,
    );
    expect(html).toContain('<div class="x-empty" data-size="center"><span class="x-empty-icon"><svg');
    expect(html).toContain('<p class="x-empty-title">No worktrees yet</p>');
    expect(html).toContain('<p class="x-empty-hint">Create one per task.</p>');
    expect(html).toContain('<div class="x-empty-actions">');
  });
  it("inline size drops the icon", () => {
    const html = renderToStaticMarkup(<EmptyState icon="branch" title="No changes" />);
    expect(html).toContain('data-size="inline"');
    expect(html).not.toContain("x-empty-icon");
  });
});
