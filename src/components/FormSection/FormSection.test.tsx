import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useId: () => "id" }));
const { FormSection } = await import("./FormSection");

describe("FormSection", () => {
  it("is a section named by its h2", () => {
    const html = renderToStaticMarkup(<FormSection title="Profile" description="Shown to teammates.">body</FormSection>);
    expect(html).toContain('<section class="x-form-section" aria-labelledby="x-form-section-id"');
    expect(html).toContain('<h2 class="x-form-section-title" id="x-form-section-id">Profile</h2>');
    expect(html).toContain('<p class="x-form-section-desc">Shown to teammates.</p>');
    expect(html).toContain('data-columns="1"');
  });
  it("supports two columns and end-aligned actions", () => {
    const html = renderToStaticMarkup(
      <FormSection columns={2} actions={<button type="button">Save</button>}>
        <input />
      </FormSection>,
    );
    expect(html).toContain('data-columns="2"');
    expect(html).toContain('<div class="x-form-section-actions"><button type="button">Save</button></div>');
    expect(html).not.toContain("aria-labelledby");
  });
  it("disabled puts the fields in a disabled fieldset and drops the actions", () => {
    const html = renderToStaticMarkup(
      <FormSection title="Roles" disabled actions={<button type="button">Save</button>}>
        <input aria-label="x" />
      </FormSection>,
    );
    expect(html).toContain('<fieldset class="x-form-section-fields" data-columns="1" disabled="">');
    expect(html).toContain('data-disabled=""');
    expect(html).not.toContain("x-form-section-actions");
    expect(renderToStaticMarkup(<FormSection title="R"><input aria-label="x" /></FormSection>)).not.toContain("fieldset");
  });
  it("aside puts the head beside a framed body that holds fields and actions", () => {
    const html = renderToStaticMarkup(
      <FormSection title="Name" description="Shown in the sidebar." layout="aside" headActions={<a href="#x">Open</a>} actions={<button type="button">Save</button>}>
        <input aria-label="x" />
      </FormSection>,
    );
    expect(html).toContain('data-layout="aside"');
    expect(html).toContain('<div class="x-form-section-grid"><div class="x-form-section-head">');
    expect(html).toContain('<div class="x-form-section-head-actions"><a href="#x">Open</a></div></div><div class="x-form-section-body"><div class="x-form-section-fields" data-columns="1">');
    expect(html).toContain('<div class="x-form-section-actions"><button type="button">Save</button></div></div></div></section>');
    expect(renderToStaticMarkup(<FormSection title="R">x</FormSection>)).not.toContain("data-layout");
    expect(renderToStaticMarkup(<FormSection id="logo" title="R">x</FormSection>)).toContain('<section id="logo" class="x-form-section"');
  });
});
