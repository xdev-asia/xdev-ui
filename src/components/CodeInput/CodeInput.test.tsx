import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { CodeInput, type CodeInputProps } from "./CodeInput";
import { formatCode, groupCode, normalizeCode } from "./normalizeCode";

const base: CodeInputProps = { length: 10, value: "", onChange: () => {}, label: "Pairing code" };

/** Types or pastes `text` into a CodeInput holding `value`. */
function enter(text: string, props: Partial<CodeInputProps> = {}) {
  const onChange = vi.fn();
  const onComplete = vi.fn();
  const root = CodeInput({ ...base, onChange, onComplete, ...props });
  findAll(root, (e) => e.type === "input")[0].props.onChange({ target: { value: text } });
  return { onChange, onComplete };
}

describe("CodeInput", () => {
  it("is one input named by label, with the cells drawn over it", () => {
    const html = renderToStaticMarkup(<CodeInput {...base} value="7K4" />);
    expect(html.match(/<input/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Pairing code"');
    expect(html.match(/class="x-code-group"/g)).toHaveLength(2);
    expect(html.match(/class="x-code-cell"/g)).toHaveLength(10);
    expect(html.match(/data-filled=""/g)).toHaveLength(3);
    expect(html).toContain('inputMode="text"');
    expect(html).not.toContain("aria-invalid");
  });
  it("groups by groupSize and uses a numeric keypad for digits", () => {
    const html = renderToStaticMarkup(<CodeInput {...base} length={6} groupSize={3} alphabet="digits" value="482" />);
    expect(html.match(/class="x-code-group"/g)).toHaveLength(2);
    expect(html).toContain('inputMode="numeric"');
  });
  it("typing lower case gives the upper case code", () => {
    expect(enter("7k4qm2xd9p").onChange).toHaveBeenCalledWith("7K4QM2XD9P");
  });
  it("pasting with a dash gives the same code", () => {
    expect(enter("7K4QM-2XD9P").onChange).toHaveBeenCalledWith("7K4QM2XD9P");
    expect(enter(" 7K4QM 2XD9P ").onChange).toHaveBeenCalledWith("7K4QM2XD9P");
  });
  it("maps O, I and L and drops letters outside the alphabet", () => {
    expect(enter("oIl").onChange).toHaveBeenCalledWith("011");
    expect(enter("U!7").onChange).toHaveBeenCalledWith("7");
  });
  it("digits rejects letters", () => {
    expect(enter("4a8-2 x", { alphabet: "digits" }).onChange).toHaveBeenCalledWith("482");
    expect(enter("abc", { alphabet: "digits", value: "12" }).onChange).toHaveBeenCalledWith("");
  });
  it("cuts the code at length", () => {
    expect(enter("7K4QM2XD9PZZ").onChange).toHaveBeenCalledWith("7K4QM2XD9P");
  });
  it("calls onComplete once, at the length", () => {
    const short = enter("7K4QM2XD9", { value: "7K4QM2XD" });
    expect(short.onComplete).not.toHaveBeenCalled();
    const full = enter("7K4QM-2XD9P");
    expect(full.onComplete).toHaveBeenCalledTimes(1);
    expect(full.onComplete).toHaveBeenCalledWith("7K4QM2XD9P");
    const again = enter("7K4QM2XD9P", { value: "7K4QM2XD9P" });
    expect(again.onChange).not.toHaveBeenCalled();
    expect(again.onComplete).not.toHaveBeenCalled();
  });
  it("invalid sets aria-invalid and the modifier; disabled disables the input", () => {
    const html = renderToStaticMarkup(<CodeInput {...base} invalid disabled />);
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('data-invalid=""');
    expect(html).toContain(" disabled=");
  });
});

describe("normalizeCode and groupCode", () => {
  it("normalises per alphabet", () => {
    expect(normalizeCode("7k4qm-2xd9p")).toBe("7K4QM2XD9P");
    expect(normalizeCode("Oo Ii Ll")).toBe("001111");
    expect(normalizeCode("12ab", "digits")).toBe("12");
  });
  it("groups and ignores separators", () => {
    expect(groupCode("7K4QM-2XD9P", 5)).toEqual(["7K4QM", "2XD9P"]);
    expect(groupCode("482 913", 3)).toEqual(["482", "913"]);
    expect(groupCode("7K4", 5)).toEqual(["7K4"]);
    expect(groupCode("", 5)).toEqual([]);
  });
});

describe("formatCode", () => {
  it("groups by 5 with a dash by default", () => {
    expect(formatCode("7K4QM2XD9P")).toBe("7K4QM-2XD9P");
  });
  it("takes a group size and a separator", () => {
    expect(formatCode("482913", 3, " ")).toBe("482 913");
    expect(formatCode("ABCDEFG", 3, "")).toBe("ABCDEFG");
  });
  it("ignores separators already in the code and keeps a short tail", () => {
    expect(formatCode("7K4QM-2XD")).toBe("7K4QM-2XD");
    expect(formatCode("48 29 13", 2, ".")).toBe("48.29.13");
  });
  it("gives an empty string for an empty code", () => {
    expect(formatCode("")).toBe("");
  });
});
