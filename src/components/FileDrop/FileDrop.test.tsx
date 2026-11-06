import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FileDrop, checkFiles, formatBytes, matchesAccept } from "./FileDrop";

const f = (name: string, size = 10, type = "") => ({ name, size, type });

describe("matchesAccept", () => {
  it("accepts everything without a list", () => {
    expect(matchesAccept(f("a.exe"), undefined)).toBe(true);
    expect(matchesAccept(f("a.exe"), " ")).toBe(true);
  });
  it("matches extensions, wildcards and exact types, ignoring case", () => {
    expect(matchesAccept(f("A.PDF"), ".pdf")).toBe(true);
    expect(matchesAccept(f("a.png", 1, "image/png"), "image/*")).toBe(true);
    expect(matchesAccept(f("a.zip", 1, "application/zip"), "image/*, application/zip")).toBe(true);
    expect(matchesAccept(f("a.txt", 1, "text/plain"), "image/*,.pdf")).toBe(false);
  });
});

describe("checkFiles", () => {
  it("rejects by type, then size, then count", () => {
    const files = [f("a.png", 5, "image/png"), f("b.txt", 5, "text/plain"), f("c.png", 500, "image/png"), f("d.png", 5, "image/png")];
    const r = checkFiles(files, { accept: "image/*", maxSize: 100 });
    expect(r.accepted.map((x) => x.name)).toEqual(["a.png"]);
    expect(r.rejected.map((x) => `${x.file.name}:${x.reason}`)).toEqual(["b.txt:type", "c.png:size", "d.png:count"]);
  });
  it("multiple honours maxFiles", () => {
    const r = checkFiles([f("a"), f("b"), f("c")], { multiple: true, maxFiles: 2 });
    expect(r.accepted).toHaveLength(2);
    expect(r.rejected[0].reason).toBe("count");
    expect(checkFiles([f("a"), f("b"), f("c")], { multiple: true }).accepted).toHaveLength(3);
  });
});

describe("formatBytes", () => {
  it("uses B, KB, MB with one decimal under ten", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
    expect(formatBytes(20 * 1024 * 1024)).toBe("20 MB");
  });
});

describe("FileDrop", () => {
  it("is a label wrapping a named file input, with limits as a hint", () => {
    const html = renderToStaticMarkup(<FileDrop label="Cover image" accept="image/*" maxSize={2 * 1024 * 1024} onFiles={() => {}} />);
    expect(html).toContain('type="file" aria-label="Cover image" accept="image/*"');
    expect(html).toContain("Accepted: image/*. Up to 2.0 MB each");
    expect(html).toContain('<span class="x-filedrop-browse">browse</span>');
  });
  it("lists items with size, progress and remove", () => {
    const html = renderToStaticMarkup(
      <FileDrop label="Files" onFiles={() => {}} onRemove={() => {}} items={[{ id: "1", name: "a.png", size: 2048, progress: 40 }, { id: "2", name: "b.png", error: "Upload failed" }]} />,
    );
    expect(html).toContain("2.0 KB");
    expect(html).toContain('aria-label="Uploading, 40%"');
    expect(html).toContain('aria-label="Remove a.png"');
    expect(html).toContain('data-error="true"');
    expect(html).toContain("Upload failed");
  });
  it("takes translated labels", () => {
    const html = renderToStaticMarkup(
      <FileDrop label="Ảnh" maxSize={1024} onFiles={() => {}} labels={{ drop: "Kéo thả tệp vào đây hoặc", browse: "chọn tệp", limits: (_a, m) => `Tối đa ${m}` }} />,
    );
    expect(html).toContain("Kéo thả tệp vào đây hoặc");
    expect(html).toContain("chọn tệp");
    expect(html).toContain("Tối đa 1.0 KB");
  });
});
