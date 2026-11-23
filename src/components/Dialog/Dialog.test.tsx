import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";

const h = vi.hoisted(() => ({ client: false, effects: [] as Array<() => void | (() => void)>, refs: [] as Array<{ current: unknown }> }));
vi.mock("react", async (orig) => ({
  ...(await orig<typeof import("react")>()),
  useId: () => "id",
  useSyncExternalStore: (_s: unknown, client: () => boolean, server: () => boolean) => (h.client ? client() : server()),
  useEffect: (fn: () => void | (() => void)) => void h.effects.push(fn),
  useRef: (v: unknown) => {
    const r = { current: v };
    h.refs.push(r);
    return r;
  },
}));
vi.mock("react-dom", () => ({ createPortal: (node: unknown, target: unknown) => createElement("x-portal", { target }, node as never) }));
const { Dialog } = await import("./Dialog");

describe("Dialog", () => {
  it("is a labelled dialog; aria-modal only when modal", () => {
    const html = renderToStaticMarkup(<Dialog title="Kill session?">Body</Dialog>);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-labelledby="x-dialog-id"');
    expect(html).toContain("dialog-actions");
    expect(html).not.toContain("aria-modal");
    expect(renderToStaticMarkup(<Dialog title="x" modal />)).toContain('aria-modal="true"');
  });
  it("is default size with a text body unless asked otherwise", () => {
    const html = renderToStaticMarkup(<Dialog title="x">Body</Dialog>);
    expect(html).toContain('data-size="default"');
    expect(html).toContain('<p class="dialog-body">Body</p>');
  });
  it("size wide and body plain allow block content", () => {
    const html = renderToStaticMarkup(
      <Dialog title="x" size="wide" body="plain">
        <div>block</div>
      </Dialog>,
    );
    expect(html).toContain('data-size="wide"');
    expect(html).toContain('<div class="dialog-body"><div>block</div></div>');
    expect(html).not.toContain("<p");
  });
  it("alert uses alertdialog", () => {
    expect(renderToStaticMarkup(<Dialog title="x" alert />)).toContain('role="alertdialog"');
  });
  it("alert describes itself with its body; a plain dialog does not", () => {
    const html = renderToStaticMarkup(<Dialog title="x" alert>Kill it?</Dialog>);
    expect(html).toContain('aria-describedby="x-dialog-id-body"');
    expect(html).toContain('<p class="dialog-body" id="x-dialog-id-body">Kill it?</p>');
    expect(renderToStaticMarkup(<Dialog title="x">Kill it?</Dialog>)).not.toContain("aria-describedby");
    expect(renderToStaticMarkup(<Dialog title="x" alert />)).not.toContain("aria-describedby");
  });
  it("wires cancel and confirm; the primary button is last", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const buttons = findAll(Dialog({ title: "x", onConfirm, onCancel }), (e) => e.type === Button);
    expect(buttons).toHaveLength(2);
    buttons[0].props.onClick();
    buttons[1].props.onClick();
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(buttons[0].props.variant).toBe("secondary");
    expect(buttons[1].props.variant).toBe("primary");
  });
  it("modal sets data-modal on the backdrop", () => {
    expect(renderToStaticMarkup(<Dialog title="x" modal />)).toContain('class="dialog-backdrop" data-modal="true"');
    expect(renderToStaticMarkup(<Dialog title="x" />)).not.toContain("data-modal");
  });
  it("wraps string children in a p and element children in a div", () => {
    expect(renderToStaticMarkup(<Dialog title="x">Plain</Dialog>)).toContain('<p class="dialog-body">Plain</p>');
    const html = renderToStaticMarkup(<Dialog title="x"><form><input /></form></Dialog>);
    expect(html).toContain('<div class="dialog-body"><form>');
    expect(html).not.toContain("<p");
  });
  it("confirmDisabled disables the confirm button", () => {
    const buttons = findAll(Dialog({ title: "x", confirmDisabled: true }), (e) => e.type === Button);
    expect(buttons[1].props.disabled).toBe(true);
    expect(buttons[0].props.disabled).toBeUndefined();
  });
  it("Escape calls onCancel when modal", () => {
    const onCancel = vi.fn();
    const [backdrop] = findAll(Dialog({ title: "x", modal: true, onCancel }), (e) => e.props.className === "dialog-backdrop");
    const other = { key: "a", stopPropagation: vi.fn() };
    backdrop.props.onKeyDown(other);
    expect(onCancel).not.toHaveBeenCalled();
    backdrop.props.onKeyDown({ key: "Escape", stopPropagation: vi.fn() });
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("description renders under the title and is wired via aria-describedby", () => {
    const html = renderToStaticMarkup(<Dialog title="Delete user?" description="This cannot be undone.">Body</Dialog>);
    expect(html).toContain('aria-describedby="x-dialog-d-id"');
    expect(html).toMatch(/<\/h2><p class="dialog-desc" id="x-dialog-d-id">This cannot be undone.<\/p>/);
    expect(renderToStaticMarkup(<Dialog title="x" />)).not.toContain("aria-describedby");
  });
  it("tone danger gives the confirm button the danger variant", () => {
    const buttons = findAll(Dialog({ title: "x", tone: "danger" }), (e) => e.type === Button);
    expect(buttons[1].props.variant).toBe("danger");
  });
  it("busy disables both actions, shows a spinner, sets aria-busy and ignores Escape", () => {
    const onCancel = vi.fn();
    const tree = Dialog({ title: "x", modal: true, busy: true, onCancel });
    const buttons = findAll(tree, (e) => e.type === Button);
    expect(buttons[0].props.disabled).toBe(true);
    expect(buttons[1].props.disabled).toBe(true);
    const html = renderToStaticMarkup(<Dialog title="x" busy confirmLabel="Delete" />);
    expect(html).toContain('aria-busy="true"');
    expect(html).toMatch(/<span class="x-spinner" data-size="sm" aria-hidden="true"><span class="x-spinner-ring"><\/span><\/span>Delete<\/button>/);
    tree.props.onKeyDown({ key: "Escape", stopPropagation: vi.fn() });
    expect(onCancel).not.toHaveBeenCalled();
  });

  describe("modal focus", () => {
    const fake = (name: string, extra: object = {}) => ({ name, focus: vi.fn(), ...extra });
    const setup = (opts: { trigger?: unknown; inside?: boolean; body?: unknown } = {}) => {
      h.effects.length = 0;
      h.refs.length = 0;
      let tree: any;
      withDocument(opts.trigger ?? null, () => {
        tree = Dialog({ title: "x", modal: true, onCancel: vi.fn() });
      });
      const [dialogRef, backdropRef] = h.refs;
      const first = fake("first");
      const last = fake("last");
      dialogRef.current = {
        focus: vi.fn(),
        querySelectorAll: () => [first, last],
        querySelector: () => opts.body ?? null,
        contains: () => Boolean(opts.inside),
      };
      const siblingOutside = { inert: false, tagName: "DIV" };
      const parent = { children: [] as unknown[], parentElement: null as unknown, inert: false };
      const backdrop = { parentElement: parent, children: [], inert: false };
      parent.children = [backdrop, siblingOutside];
      backdropRef.current = backdrop;
      return { tree, first, last, siblingOutside };
    };
    const withDocument = (active: unknown, fn: () => void) => {
      vi.stubGlobal("document", { activeElement: active });
      try {
        fn();
      } finally {
        vi.unstubAllGlobals();
      }
    };
    it("moves focus in, makes the page inert and restores both on close", () => {
      const trigger = fake("trigger");
      const { first, siblingOutside } = setup({ trigger });
      withDocument(trigger, () => {
        const cleanup = h.effects[0]() as () => void;
        expect(first.focus).toHaveBeenCalledOnce();
        expect(siblingOutside.inert).toBe(true);
        cleanup();
      });
      expect(siblingOutside.inert).toBe(false);
      expect(trigger.focus).toHaveBeenCalledOnce();
    });
    it("keeps focus a child already took with autoFocus, and still restores the trigger read at render", () => {
      const trigger = fake("trigger");
      const auto = fake("auto");
      const { first } = setup({ trigger, inside: true });
      withDocument(auto, () => {
        const cleanup = h.effects[0]!() as () => void;
        expect(first.focus).not.toHaveBeenCalled();
        cleanup();
      });
      expect(trigger.focus).toHaveBeenCalledOnce();
    });
    it("starts on the first control of the body, not the close button in the header", () => {
      const field = fake("field");
      const { first } = setup({ body: { querySelectorAll: () => [field] } });
      withDocument(null, () => void h.effects[0]!());
      expect(field.focus).toHaveBeenCalledOnce();
      expect(first.focus).not.toHaveBeenCalled();
    });
    it("does nothing in the effect when not modal", () => {
      h.effects.length = 0;
      Dialog({ title: "x" });
      expect(h.effects[0]()).toBeUndefined();
    });
    it("Tab on the last control wraps to the first; Shift+Tab on the first wraps to the last", () => {
      const { tree, first, last } = setup();
      const onKeyDown = tree.props.onKeyDown;
      const ev = (shiftKey: boolean) => ({ key: "Tab", shiftKey, preventDefault: vi.fn(), stopPropagation: vi.fn() });
      let e = ev(false);
      withDocument(last, () => onKeyDown(e));
      expect(e.preventDefault).toHaveBeenCalledOnce();
      expect(first.focus).toHaveBeenCalledOnce();
      e = ev(true);
      withDocument(first, () => onKeyDown(e));
      expect(e.preventDefault).toHaveBeenCalledOnce();
      expect(last.focus).toHaveBeenCalledOnce();
    });
    it("Tab between controls is left to the browser", () => {
      const { tree, first } = setup();
      const e = { key: "Tab", shiftKey: false, preventDefault: vi.fn() };
      withDocument(first, () => tree.props.onKeyDown(e));
      expect(e.preventDefault).not.toHaveBeenCalled();
    });
  });
  describe("portal", () => {
    afterEach(() => {
      h.client = false;
      vi.unstubAllGlobals();
    });
    const mounted = () => {
      h.client = true;
      const body = { tag: "body" };
      vi.stubGlobal("document", { body });
      return body;
    };
    it("renders into document.body once mounted", () => {
      const body = mounted();
      const tree = Dialog({ title: "x", modal: true }) as any;
      expect(tree.type).toBe("x-portal");
      expect(tree.props.target).toBe(body);
      expect(tree.props.children.props.className).toBe("dialog-backdrop");
    });
    it("portal={false} renders in place", () => {
      mounted();
      expect((Dialog({ title: "x", modal: true, portal: false }) as any).props.className).toBe("dialog-backdrop");
    });
    it("renders in place on the server", () => {
      expect(renderToStaticMarkup(<Dialog title="x" modal />)).toContain('class="dialog-backdrop"');
    });
    it("never portals a non-modal preview", () => {
      mounted();
      expect((Dialog({ title: "x" }) as any).props.className).toBe("dialog-backdrop");
    });
  });
  it("secondaryActions render between Cancel and the confirm button", () => {
    const html = renderToStaticMarkup(<Dialog title="Move this event?" confirmLabel="Whole series" secondaryActions={<button type="button">Only this one</button>} />);
    expect(html.indexOf("Cancel")).toBeLessThan(html.indexOf("Only this one"));
    expect(html.indexOf("Only this one")).toBeLessThan(html.indexOf("Whole series"));
  });
  it("actions replace the built-in Cancel and confirm buttons", () => {
    const html = renderToStaticMarkup(<Dialog title="Details" actions={<button type="button">Close</button>} />);
    expect(html).toContain('<div class="dialog-actions"><button type="button">Close</button></div>');
    expect(html).not.toContain("Cancel");
    expect(html).not.toContain(">OK<");
  });
  it("actions={null} renders no action row", () => {
    expect(renderToStaticMarkup(<Dialog title="x" actions={null} />)).not.toContain("dialog-actions");
  });
  it("dismissible adds a labelled close button that calls onCancel, disabled while busy", () => {
    const onCancel = vi.fn();
    const close = findAll(Dialog({ title: "x", dismissible: true, onCancel, labels: { close: "Đóng" } }), (e) => e.type === IconButton)[0]!;
    expect(close.props.label).toBe("Đóng");
    expect(close.props.icon).toBe("close");
    close.props.onClick();
    expect(onCancel).toHaveBeenCalledOnce();
    const busyClose = findAll(Dialog({ title: "x", dismissible: true, busy: true }), (e) => e.type === IconButton)[0]!;
    expect(busyClose.props.disabled).toBe(true);
    expect(renderToStaticMarkup(<Dialog title="x" />)).not.toContain("dialog-head");
  });
});
