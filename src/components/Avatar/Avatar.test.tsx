import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Avatar, avatarInitials } from "./Avatar";

describe("avatarInitials", () => {
  it("takes the first code point of the first and last words", () => {
    expect(avatarInitials("Trần Đức Duy")).toBe("TD");
    expect(avatarInitials("duy")).toBe("D");
    expect(avatarInitials("")).toBe("?");
    expect(avatarInitials("   ")).toBe("?");
    expect(avatarInitials("  a  b ")).toBe("AB");
    expect(avatarInitials("Ada Lovelace")).toBe("AL");
  });
  it("does not split a surrogate pair", () => {
    expect(avatarInitials("😀 smile")).toBe("😀S");
  });
});

describe("Avatar", () => {
  it("renders an image when src is given", () => {
    const html = renderToStaticMarkup(<Avatar name="Duy" src="data:image/png;base64,AAAA" />);
    expect(html).toContain("<img");
    expect(html).toContain('src="data:image/png;base64,AAAA"');
    expect(html).toContain('alt=""');
    expect(html).not.toContain("x-avatar-initials");
  });
  it("renders the initials without src", () => {
    for (const src of [undefined, null, ""]) {
      const html = renderToStaticMarkup(<Avatar name="Trần Đức Duy" src={src} />);
      expect(html).not.toContain("<img");
      expect(html).toContain("x-avatar-initials");
      expect(html).toContain(">TD<");
    }
  });
  it("labels the avatar with the name and hides the initials from screen readers", () => {
    const html = renderToStaticMarkup(<Avatar name="Duy" />);
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Duy"');
    expect(html).toContain('aria-hidden="true"');
  });
  it("sets the size, md by default", () => {
    expect(renderToStaticMarkup(<Avatar name="a" />)).toContain('data-size="md"');
    expect(renderToStaticMarkup(<Avatar name="a" size="lg" />)).toContain('data-size="lg"');
  });
});
