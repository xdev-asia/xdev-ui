import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Field } from "./Field";
import { Select } from "../Select/Select";
import { Textarea } from "../Textarea/Textarea";

const MARK = '<span class="x-label-required" aria-hidden="true">*</span>';

describe("required marker", () => {
  it("Field, Textarea and Select draw an aria-hidden asterisk when required", () => {
    expect(renderToStaticMarkup(<Field label="Name" required />)).toContain(MARK);
    expect(renderToStaticMarkup(<Textarea label="Notes" required />)).toContain(MARK);
    expect(renderToStaticMarkup(<Select label="Role" required options={[{ value: "a", label: "A" }]} />)).toContain(MARK);
  });

  it("keeps required on the control, so assistive tech hears it once", () => {
    expect(renderToStaticMarkup(<Field label="Name" required />)).toMatch(/<input[^>]*required/);
    expect(renderToStaticMarkup(<Textarea label="Notes" required />)).toMatch(/<textarea[^>]*required/);
  });

  it("draws nothing when not required", () => {
    expect(renderToStaticMarkup(<Field label="Name" />)).not.toContain("x-label-required");
    expect(renderToStaticMarkup(<Textarea label="Notes" />)).not.toContain("x-label-required");
  });
});

describe("Textarea hideLabel", () => {
  it("keeps the label for screen readers only", () => {
    const html = renderToStaticMarkup(<Textarea label="Message" hideLabel />);
    expect(html).toContain('class="x-label x-sr-only"');
    expect(html).toContain(">Message<");
  });
});
