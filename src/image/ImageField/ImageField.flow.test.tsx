import { beforeEach, describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

// Hooks run without a renderer: `state` seeds useState by call order (over, source, problem, uploadPreview),
// `setters` records each setter. Effects do not run, so the field counts as mounted.
let state: unknown[] = [];
let setters: ReturnType<typeof vi.fn>[] = [];
vi.mock("react", async (orig) => {
  const real = await orig<typeof import("react")>();
  let i = 0;
  return {
    ...real,
    useId: () => "id",
    useEffect: () => {},
    useRef: (v: unknown) => ({ current: v }),
    useState: (init: unknown) => {
      if (i >= setters.length) i = 0;
      const n = i++;
      return [n < state.length && state[n] !== undefined ? state[n] : init, setters[n]];
    },
  };
});
vi.mock("react-easy-crop", () => ({ default: () => null }));
const cropped = new Blob(["x"], { type: "image/webp" });
vi.mock("../crop", async (orig) => ({
  ...(await orig<typeof import("../crop")>()),
  loadImage: vi.fn(async () => ({ naturalWidth: 3200, naturalHeight: 1800 })),
  cropToBlob: vi.fn(async () => cropped),
}));
const { ImageField } = await import("./ImageField");
const { ImageCropper } = await import("../ImageCropper/ImageCropper");
const { cropToBlob } = await import("../crop");

const aspect = { ratio: 16 / 9, width: 1600, height: 900 };
const area = { x: 0, y: 0, width: 1600, height: 900 };
const flush = () => new Promise((r) => setTimeout(r, 0));
const drop = (files: File[]) => ({ preventDefault: vi.fn(), dataTransfer: { files } });

beforeEach(() => {
  state = [];
  setters = [vi.fn(), vi.fn(), vi.fn(), vi.fn()];
});

describe("ImageField flow", () => {
  it("a dropped image anywhere on the field opens the cropper on an object URL", () => {
    const tree = ImageField({ label: "Cover", aspect, value: "https://cdn.test/a.webp", onChange: vi.fn(), onUpload: vi.fn() });
    const e = drop([new File(["x"], "photo.png", { type: "image/png" }), new File(["y"], "second.png", { type: "image/png" })]);
    tree.props.onDrop(e);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(setters[2]).toHaveBeenCalledWith(null);
    expect(setters[1]).toHaveBeenCalledWith({ url: expect.stringMatching(/^blob:/), name: "photo.png", fresh: true });
  });

  it("a wrong type or a too large file shows why and opens nothing", () => {
    const tree = ImageField({ label: "Cover", aspect, value: null, maxSize: 4, onChange: vi.fn(), onUpload: vi.fn() });
    tree.props.onDrop(drop([new File(["x"], "notes.txt", { type: "text/plain" })]));
    expect(setters[2]).toHaveBeenLastCalledWith("notes.txt: this file type is not accepted");
    tree.props.onDrop(drop([new File(["too large"], "big.png", { type: "image/png" })]));
    expect(setters[2]).toHaveBeenLastCalledWith("big.png is larger than 4 B");
    expect(setters[1]).not.toHaveBeenCalled();
  });

  it("confirm crops to the output size, uploads, and passes the resolved URL to onChange", async () => {
    state = [false, { url: "blob:picked", name: "photo.png", fresh: true }];
    const onChange = vi.fn();
    const onBusyChange = vi.fn();
    const onUpload = vi.fn(async () => "https://cdn.test/new.webp");
    const tree = ImageField({ label: "Cover", aspect, value: null, onChange, onUpload, onBusyChange });
    const cropper = findAll(tree, (el) => el.type === ImageCropper)[0];
    expect(cropper.props).toMatchObject({ src: "blob:picked", aspect: 16 / 9 });
    cropper.props.onConfirm(area, 90);
    await flush();
    expect(cropToBlob).toHaveBeenCalledWith(expect.anything(), area, 90, aspect, undefined);
    expect(onUpload).toHaveBeenCalledWith(cropped, "photo.webp");
    expect(onChange).toHaveBeenCalledWith("https://cdn.test/new.webp");
    expect(setters[1]).toHaveBeenCalledWith(null);
    expect(setters[3].mock.calls.map((c) => c[0] === null)).toEqual([false, true]);
    expect(onBusyChange.mock.calls).toEqual([[true], [false]]);
  });

  it("a failed upload shows the error inline and leaves the value alone", async () => {
    state = [false, { url: "blob:picked", name: "photo.png", fresh: true }];
    const onChange = vi.fn();
    const tree = ImageField({ label: "Cover", aspect, value: null, onChange, onUpload: vi.fn(async () => Promise.reject(new Error("Server said no"))) });
    findAll(tree, (el) => el.type === ImageCropper)[0].props.onConfirm(area, 0);
    await flush();
    expect(onChange).not.toHaveBeenCalled();
    expect(setters[2]).toHaveBeenLastCalledWith("Server said no");
  });

  it("remove clears the value; cancel closes the cropper", () => {
    state = [false, { url: "blob:picked", name: "photo.png", fresh: true }];
    const onChange = vi.fn();
    const tree = ImageField({ label: "Cover", aspect, value: "https://cdn.test/a.webp", onChange, onUpload: vi.fn() });
    findAll(tree, (el) => el.props.children === "Remove")[0].props.onClick();
    expect(onChange).toHaveBeenCalledWith(null);
    findAll(tree, (el) => el.type === ImageCropper)[0].props.onCancel();
    expect(setters[1]).toHaveBeenCalledWith(null);
  });
});
