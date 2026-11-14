import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ModelChip, ModelChipAdd } from "./ModelChip";

describe("ModelChip", () => {
  it("shows the id in a mono pill with its action beside it, and the name with its actions under it", () => {
    const html = renderToStaticMarkup(<ModelChip code="openai/gpt-5.5" name="GPT-5.5" codeAction={<b>copy</b>} actions={<i>test</i>} />);
    expect(html).toContain('<div class="x-model-chip">');
    expect(html).toContain('<code class="x-model-chip-code" title="openai/gpt-5.5">openai/gpt-5.5</code><b>copy</b>');
    expect(html).toContain('<span class="x-model-chip-name">GPT-5.5</span><span class="x-model-chip-actions"><i>test</i></span>');
  });

  it("marks a turned-off model and leaves out an empty second line", () => {
    const html = renderToStaticMarkup(<ModelChip code="x/y" dimmed />);
    expect(html).toContain("data-dimmed");
    expect(html).not.toContain("x-model-chip-name");
  });

  it("ends the list with an add button", () => {
    const html = renderToStaticMarkup(<ModelChipAdd label="Add model" onClick={() => {}} />);
    expect(html).toContain('<button type="button" class="x-model-chip x-model-chip-add">');
    expect(html).toContain("<span>Add model</span>");
  });
});
