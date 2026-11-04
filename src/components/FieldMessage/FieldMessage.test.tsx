import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FieldMessage } from "./FieldMessage";

describe("FieldMessage", () => {
  it("announces errors", () => {
    expect(renderToStaticMarkup(<FieldMessage id="name-err">Branch already exists</FieldMessage>)).toBe(
      '<p class="x-field-msg error-text" data-tone="error" id="name-err" role="alert">Branch already exists</p>',
    );
  });
  it("keeps warn and info quiet", () => {
    const warn = renderToStaticMarkup(<FieldMessage tone="warn">Name has spaces</FieldMessage>);
    expect(warn).toContain('data-tone="warn"');
    expect(warn).not.toContain("role=");
    expect(renderToStaticMarkup(<FieldMessage tone="info">x</FieldMessage>)).not.toContain("error-text");
  });
});
