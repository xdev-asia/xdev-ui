import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ImageField, afterUpload, describeAccept, outputName, recropSource, urlTracker } from "./ImageField";

vi.mock("react-easy-crop", () => ({ default: () => <div data-cropper="" /> }));

const aspect = { ratio: 16 / 9, width: 1600, height: 900 };
const noop = (): void => {};
const upload = async (): Promise<string> => "https://cdn.test/a.webp";

describe("ImageField helpers", () => {
  it("crop again opens the original only while the field shows the value it produced", () => {
    const kept = { url: "blob:orig", value: "https://cdn.test/a.webp" };
    expect(recropSource(kept, "https://cdn.test/a.webp")).toBe("blob:orig");
    expect(recropSource(kept, "https://cdn.test/other.webp")).toBe("https://cdn.test/other.webp");
    expect(recropSource(null, "https://cdn.test/a.webp")).toBe("https://cdn.test/a.webp");
    expect(recropSource(kept, null)).toBeNull();
  });

  it("after an upload keeps the picked original for a string result and revokes what is no longer needed", () => {
    const old = { url: "blob:old", value: "u1" };
    expect(afterUpload(old, { url: "blob:new", fresh: true }, "u2")).toEqual({ kept: { url: "blob:new", value: "u2" }, revoke: ["blob:old"] });
    expect(afterUpload(null, { url: "blob:new", fresh: true }, undefined)).toEqual({ kept: null, revoke: ["blob:new"] });
    // Cropped again from the kept original: keep it, now tied to the new value.
    expect(afterUpload(old, { url: "blob:old", fresh: false }, "u3")).toEqual({ kept: { url: "blob:old", value: "u3" }, revoke: [] });
    expect(afterUpload(old, { url: "https://cdn.test/a.webp", fresh: false }, { id: 1 })).toEqual({ kept: null, revoke: ["blob:old"] });
  });

  it("tracks the object URLs it creates and revokes only those", () => {
    let n = 0;
    const released: string[] = [];
    const t = urlTracker(() => `blob:${++n}`, (u) => released.push(u));
    const a = t.create(new Blob());
    t.create(new Blob());
    t.revoke(a);
    t.revoke(a);
    t.revoke("https://cdn.test/a.webp");
    t.revokeAll();
    t.revokeAll();
    expect(released).toEqual(["blob:1", "blob:2"]);
  });

  it("names formats and the output file", () => {
    expect(describeAccept("image/jpeg, image/png,.webp")).toBe("JPEG, PNG, WEBP");
    expect(outputName("Photo 1.HEIC")).toBe("Photo 1.webp");
    expect(outputName("cover.png", "image/jpeg")).toBe("cover.jpg");
  });
});

describe("ImageField markup", () => {
  it("empty: a labelled file input, a drop zone with the limits, no preview", () => {
    const html = renderToStaticMarkup(<ImageField label="Cover" aspect={aspect} value={null} onChange={noop} onUpload={upload} required />);
    expect(html).toMatch(/<span class="x-image-field-label" id="([^"]+)">Cover<span class="x-image-field-required" aria-hidden="true">\*<\/span><\/span>/);
    const labelId = /class="x-image-field-label" id="([^"]+)"/.exec(html)![1];
    expect(html).toContain(`aria-labelledby="${labelId}"`);
    expect(html).toContain('accept="image/jpeg,image/png,image/webp"');
    expect(html).toContain('aria-required="true"');
    expect(html).toContain('class="x-image-field-zone"');
    expect(html).toContain("Drop an image here or");
    expect(html).toContain("JPEG, PNG, WEBP, up to 10 MB");
    expect(html).not.toContain("<img");
    expect(html).not.toContain('role="dialog"');
  });

  it("with a value: the preview at the field's ratio and crop again, replace, extra actions, remove", () => {
    const html = renderToStaticMarkup(
      <ImageField label="Cover" aspect={aspect} value="https://cdn.test/a.webp" onChange={noop} onUpload={upload} actions={<button type="button">Library</button>} />,
    );
    expect(html).toContain(`style="aspect-ratio:${16 / 9}"`);
    expect(html).toContain('<img src="https://cdn.test/a.webp" alt=""/>');
    expect(html).toContain('tabindex="-1"');
    const order = ["Crop again", "Replace", "Library", "Remove"].map((t) => html.indexOf(t));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(order[0]).toBeGreaterThan(0);
    expect(html).not.toContain("x-image-field-zone");
  });

  it("a form error is announced and described on the input", () => {
    const html = renderToStaticMarkup(<ImageField label="Cover" aspect={aspect} value={null} onChange={noop} onUpload={upload} error="Add a cover image" />);
    const noteId = /<p class="x-image-field-error" id="([^"]+)" role="alert">Add a cover image<\/p>/.exec(html)?.[1];
    expect(noteId).toBeTruthy();
    expect(html).toContain(`aria-describedby="${noteId}"`);
    expect(html).toContain('aria-invalid="true"');
  });

  it("disabled disables the input and every button", () => {
    const html = renderToStaticMarkup(<ImageField label="Cover" aspect={aspect} value="https://cdn.test/a.webp" disabled onChange={noop} onUpload={upload} />);
    expect(html).toContain('data-disabled="true"');
    expect(html.match(/disabled=""/g)).toHaveLength(4);
  });

  it("takes translated labels", () => {
    const labels = { drop: "Kéo ảnh vào đây hoặc", browse: "chọn tệp", limits: () => "JPG, PNG hoặc WebP", recrop: "Cắt lại", replace: "Đổi ảnh", remove: "Xoá" };
    const empty = renderToStaticMarkup(<ImageField label="Ảnh bìa" aspect={aspect} value={null} onChange={noop} onUpload={upload} labels={labels} />);
    for (const t of ["Kéo ảnh vào đây hoặc", "chọn tệp", "JPG, PNG hoặc WebP"]) expect(empty).toContain(t);
    const full = renderToStaticMarkup(<ImageField label="Ảnh bìa" aspect={aspect} value="https://cdn.test/a.webp" onChange={noop} onUpload={upload} labels={labels} />);
    for (const t of ["Cắt lại", "Đổi ảnh", "Xoá"]) expect(full).toContain(t);
    const text = (empty + full).replace(/<[^>]*>/g, " ");
    for (const t of ["Drop an image", "browse", "Crop again", "Replace", "Remove"]) expect(text).not.toContain(t);
  });
});
