import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { Button } from "../../components/Button/Button";

// Hooks run without a renderer: `state` seeds useState by call order, `setters` records each setter.
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
vi.mock("react-easy-crop", () => ({
  default: (props: Record<string, unknown>) => <div data-cropper={String(props.image)} data-aspect={String(props.aspect)} />,
}));
const { ImageCropper } = await import("./ImageCropper");
const Cropper = (await import("react-easy-crop")).default;
const noop = (): void => {};
const area = { x: 10, y: 20, width: 160, height: 90 };

beforeEach(() => {
  state = [];
  setters = [vi.fn(), vi.fn(), vi.fn(), vi.fn()];
});

describe("ImageCropper", () => {
  it("is a labelled modal dialog with the cropper, zoom 1 to 3 and the confirm button last", () => {
    const html = renderToStaticMarkup(<ImageCropper src="blob:a" aspect={16 / 9} onCancel={noop} onConfirm={noop} />);
    expect(html).toContain('role="dialog" aria-modal="true" aria-labelledby="x-cropper-id" aria-describedby="x-cropper-d-id"');
    expect(html).toContain('<h2 class="dialog-title" id="x-cropper-id">Crop image</h2>');
    expect(html).toContain(`data-cropper="blob:a" data-aspect="${16 / 9}"`);
    expect(html).toMatch(/<span>Zoom<\/span><input type="range" min="1" max="3" step="0.05" value="1"/);
    expect(html).toContain("1.0×");
    expect(html).toMatch(/Cancel<\/button><button type="button" class="btn" disabled="">Use this image<\/button><\/div><\/div><\/div>$/);
  });

  it("passes the frame label and fixed zoom range to react-easy-crop", () => {
    const tree = ImageCropper({ src: "blob:a", aspect: 1, onCancel: noop, onConfirm: noop });
    const cropper = findAll(tree, (el) => el.type === Cropper)[0];
    expect(cropper.props).toMatchObject({ image: "blob:a", aspect: 1, minZoom: 1, maxZoom: 3, cropperProps: { "aria-label": "Crop frame" } });
    cropper.props.onCropComplete({}, area);
    expect(setters[3]).toHaveBeenCalledWith(area);
  });

  it("confirms the area and rotation once the area exists", () => {
    state = [undefined, 2, 90, area];
    const onConfirm = vi.fn();
    const tree = ImageCropper({ src: "blob:a", aspect: 1, onCancel: noop, onConfirm });
    const buttons = findAll(tree, (el) => el.type === Button);
    expect(buttons.at(-1)!.props.disabled).toBeFalsy();
    buttons.at(-1)!.props.onClick();
    expect(onConfirm).toHaveBeenCalledWith(area, 90);
  });

  it("zoom slider, rotate and reset update the state", () => {
    const tree = ImageCropper({ src: "blob:a", aspect: 1, onCancel: noop, onConfirm: noop });
    findAll(tree, (el) => el.type === "input")[0].props.onChange({ currentTarget: { value: "2.5" } });
    expect(setters[1]).toHaveBeenCalledWith(2.5);
    const [rotate, reset] = findAll(tree, (el) => el.type === Button);
    rotate.props.onClick();
    const turn = setters[2].mock.calls[0][0] as (r: number) => number;
    expect([turn(0), turn(270)]).toEqual([90, 0]);
    reset.props.onClick();
    expect(setters[0]).toHaveBeenCalledWith({ x: 0, y: 0 });
    expect(setters[1]).toHaveBeenLastCalledWith(1);
    expect(setters[2]).toHaveBeenLastCalledWith(0);
  });

  it("Esc and Cancel call onCancel and stop at this dialog", () => {
    const onCancel = vi.fn();
    const tree = ImageCropper({ src: "blob:a", aspect: 1, onCancel, onConfirm: noop });
    const stop = vi.fn();
    tree.props.onKeyDown({ key: "Escape", stopPropagation: stop });
    expect(onCancel).toHaveBeenCalledOnce();
    expect(stop).toHaveBeenCalled();
    findAll(tree, (el) => el.type === Button).at(-2)!.props.onClick();
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it("busy disables every control and ignores cancel and confirm", () => {
    state = [undefined, undefined, undefined, area];
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const html = renderToStaticMarkup(<ImageCropper src="blob:a" aspect={1} busy onCancel={onCancel} onConfirm={onConfirm} />);
    expect(html).toContain('aria-busy="true"');
    expect(html.match(/disabled=""/g)).toHaveLength(5);
    expect(html).toContain('class="x-spinner"');
    const tree = ImageCropper({ src: "blob:a", aspect: 1, busy: true, onCancel, onConfirm });
    tree.props.onKeyDown({ key: "Escape", stopPropagation: noop });
    findAll(tree, (el) => el.type === Button).forEach((b) => b.props.onClick?.());
    expect(onCancel).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("modal false renders markup only, without the key handler", () => {
    const tree = ImageCropper({ src: "blob:a", aspect: 1, modal: false, onCancel: noop, onConfirm: noop });
    expect(tree.props.onKeyDown).toBeUndefined();
    expect(tree.props["data-modal"]).toBeUndefined();
  });

  it("takes translated labels and a title", () => {
    const html = renderToStaticMarkup(
      <ImageCropper
        src="blob:a"
        aspect={1}
        title="Cắt ảnh bìa"
        onCancel={noop}
        onConfirm={noop}
        labels={{ description: "Kéo để di chuyển ảnh", zoom: "Thu phóng", rotate: "Xoay 90°", reset: "Đặt lại", cancel: "Huỷ", confirm: "Dùng ảnh này" }}
      />,
    );
    for (const text of ["Cắt ảnh bìa", "Kéo để di chuyển ảnh", "Thu phóng", "Xoay 90°", "Đặt lại", "Huỷ", "Dùng ảnh này"]) expect(html).toContain(text);
    expect(html).not.toContain("Crop image");
  });
});
