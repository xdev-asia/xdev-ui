import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Emblem } from "./Emblem";

describe("Emblem", () => {
  it("shows the given letters on the thing's colour, named for screen readers", () => {
    const html = renderToStaticMarkup(<Emblem name="OpenAI" text="OA" color="seagreen" />);
    expect(html).toBe('<span class="x-emblem" data-size="md" role="img" aria-label="OpenAI" style="--x-emblem-color:seagreen"><span class="x-emblem-text" aria-hidden="true">OA</span></span>');
  });

  it("falls back to the initials of the name, and to the accent when there is no colour", () => {
    const html = renderToStaticMarkup(<Emblem name="Google Gemini" />);
    expect(html).toContain('<span class="x-emblem-text" aria-hidden="true">GG</span>');
    expect(html).not.toContain("style=");
  });

  it("keeps at most three letters", () => {
    expect(renderToStaticMarkup(<Emblem name="Volcengine Ark" text="ARKX" />)).toContain(">ARK<");
  });

  it("shows a logo when it has one, and an icon when asked for one", () => {
    const logo = renderToStaticMarkup(<Emblem name="OpenAI" src="/logos/openai.svg" />);
    expect(logo).toContain('<img class="x-emblem-img" alt="" src="/logos/openai.svg"/>');
    expect(logo).not.toContain("x-emblem-text");
    // A logo sits on a light plate in both themes; the stylesheet keys on this.
    expect(logo).toContain('data-logo=""');
    expect(renderToStaticMarkup(<Emblem name="OpenAI" text="OA" />)).not.toContain("data-logo");
    const icon = renderToStaticMarkup(<Emblem name="Usage" icon="activity" />);
    expect(icon).toContain("<svg");
    expect(icon).not.toContain("x-emblem-text");
  });

  it("comes in three sizes", () => {
    for (const size of ["sm", "md", "lg"] as const) expect(renderToStaticMarkup(<Emblem name="A" size={size} />)).toContain(`data-size="${size}"`);
  });
});
