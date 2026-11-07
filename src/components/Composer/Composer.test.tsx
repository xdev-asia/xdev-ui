import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { Composer } from "./Composer";

const key = (k: string, extra: Record<string, unknown> = {}) => ({
  key: k,
  shiftKey: false,
  nativeEvent: { isComposing: false },
  preventDefault: vi.fn(),
  ...extra,
});
const textarea = (el: ReturnType<typeof Composer>) => findAll(el, (e) => e.type === "textarea")[0];

describe("Composer", () => {
  it("renders the box, one primary Send, and omits model and attach by default", () => {
    const html = renderToStaticMarkup(<Composer value="hi" onChange={() => {}} onSend={() => {}} />);
    expect(html).toContain('aria-label="Message"');
    expect(html).toContain('class="btn x-composer-send"');
    expect(html.match(/class="btn[ "]/g)).toHaveLength(1);
    expect(html).not.toContain("lang-select");
    expect(html).not.toContain("ws-icon-btn");
  });
  it("renders model select and attach button when given", () => {
    const html = renderToStaticMarkup(
      <Composer value="hi" onChange={() => {}} onSend={() => {}} onAttach={() => {}} model={{ value: "b", options: [{ value: "a", label: "A" }, { value: "b", label: "B" }] }} />,
    );
    expect(html).toContain('aria-label="Model"');
    expect(html).toContain('<option value="b" selected="">B</option>');
    expect(html).toContain('aria-label="Attach a file"');
  });
  it("Enter sends and prevents the newline", () => {
    const onSend = vi.fn();
    const ta = textarea(Composer({ value: "hi", onChange: () => {}, onSend }));
    const e = key("Enter");
    ta.props.onKeyDown(e);
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(e.preventDefault).toHaveBeenCalled();
  });
  it("Shift+Enter, other keys and IME composition do not send", () => {
    const onSend = vi.fn();
    const ta = textarea(Composer({ value: "hi", onChange: () => {}, onSend }));
    const shift = key("Enter", { shiftKey: true });
    ta.props.onKeyDown(shift);
    ta.props.onKeyDown(key("a"));
    ta.props.onKeyDown(key("Enter", { nativeEvent: { isComposing: true } }));
    expect(onSend).not.toHaveBeenCalled();
    expect(shift.preventDefault).not.toHaveBeenCalled();
  });
  it("blank text or disabled blocks Enter and disables Send", () => {
    const onSend = vi.fn();
    textarea(Composer({ value: "  ", onChange: () => {}, onSend })).props.onKeyDown(key("Enter"));
    textarea(Composer({ value: "hi", onChange: () => {}, onSend, disabled: true })).props.onKeyDown(key("Enter"));
    expect(onSend).not.toHaveBeenCalled();
    expect(renderToStaticMarkup(<Composer value="" onChange={() => {}} onSend={onSend} />)).toContain("disabled");
  });
  it("labels replace every English default", () => {
    const html = renderToStaticMarkup(
      <Composer
        value="x"
        onChange={() => {}}
        onSend={() => {}}
        onAttach={() => {}}
        model={{ value: "a", options: [{ value: "a", label: "A" }] }}
        labels={{ input: "§i§", send: "§s§", attach: "§a§", model: "§m§" }}
      />,
    );
    for (const w of ["Message", ">Send<", "Attach a file", '"Model"']) expect(html).not.toContain(w);
    for (const w of ["§i§", "§s§", "§a§", "§m§"]) expect(html).toContain(w);
  });
});
