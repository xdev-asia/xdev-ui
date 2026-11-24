import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Button, type ButtonRouterLinkProps } from "./Button";

describe("Button", () => {
  it("defaults to type=button and the secondary variant", () => {
    const html = renderToStaticMarkup(<Button>Go</Button>);
    expect(html).toContain('type="button"');
    expect(html).toContain('class="btn-secondary"');
  });
  it("primary variant uses btn", () => {
    expect(renderToStaticMarkup(<Button variant="primary">Go</Button>)).toContain('class="btn"');
  });
  it("secondary variant uses btn-secondary", () => {
    expect(renderToStaticMarkup(<Button variant="secondary">Go</Button>)).toContain("btn-secondary");
  });
  it("allows type=submit and renders the icon", () => {
    const html = renderToStaticMarkup(
      <Button type="submit" icon="search">
        Go
      </Button>,
    );
    expect(html).toContain('type="submit"');
    expect(html).toContain("x-icon");
  });
  it("wires onClick", () => {
    const onClick = vi.fn();
    Button({ onClick }).props.onClick();
    expect(onClick).toHaveBeenCalledOnce();
  });
  it("danger, ghost and link variants have their own class", () => {
    expect(renderToStaticMarkup(<Button variant="danger">Delete</Button>)).toContain('class="btn-danger"');
    expect(renderToStaticMarkup(<Button variant="ghost">More</Button>)).toContain('class="btn-ghost"');
    expect(renderToStaticMarkup(<Button variant="link">Open</Button>)).toContain('class="btn-link"');
  });
  it("size sm sets data-size, md (default) sets nothing", () => {
    expect(renderToStaticMarkup(<Button size="sm">Go</Button>)).toContain('data-size="sm"');
    expect(renderToStaticMarkup(<Button>Go</Button>)).not.toContain("data-size");
  });
  it("passes ref through", () => {
    const ref = { current: null };
    expect(Button({ ref, children: "Go" }).props.ref).toBe(ref);
  });
  it("href renders an anchor with the same classes", () => {
    const html = renderToStaticMarkup(
      <Button href="/docs" variant="secondary" icon="search">
        Docs
      </Button>,
    );
    expect(html).toMatch(/^<a /);
    expect(html).toContain('href="/docs"');
    expect(html).toContain('class="btn-secondary"');
    expect(html).not.toContain("type=");
  });
  it("disabled href drops href and sets aria-disabled", () => {
    const html = renderToStaticMarkup(
      <Button href="/docs" disabled>
        Docs
      </Button>,
    );
    expect(html).not.toContain("href=");
    expect(html).toContain('aria-disabled="true"');
    expect(html).not.toContain(" disabled=");
  });

  describe("busy", () => {
    it("button: sets aria-busy, disables, ignores clicks, shows a spinner in place of the icon and keeps the label", () => {
      const onClick = vi.fn();
      const el = Button({ busy: true, icon: "save", onClick, children: "Save" });
      expect(el.props.disabled).toBe(true);
      expect(el.props.onClick).toBeUndefined();
      const html = renderToStaticMarkup(
        <Button busy icon="save" onClick={onClick}>
          Save
        </Button>,
      );
      expect(html).toContain('aria-busy="true"');
      expect(html).toMatch(/<button[^>]* disabled=""/);
      expect(html).toContain("x-spinner");
      expect(html).not.toContain("x-icon");
      expect(html).toContain("Save");
      expect(onClick).not.toHaveBeenCalled();
    });
    it("button: the spinner is hidden from assistive tech, so the label stays the accessible name", () => {
      const html = renderToStaticMarkup(<Button busy>Save</Button>);
      expect(html).toMatch(/<span class="x-btn-busy" aria-hidden="true">/);
      expect(html).not.toMatch(/\bLoading\b/);
    });
    it("button: not busy leaves disabled, aria-busy and onClick alone", () => {
      const onClick = vi.fn();
      const el = Button({ onClick, children: "Save" });
      expect(el.props.disabled).toBeFalsy();
      expect(el.props["aria-busy"]).toBeUndefined();
      el.props.onClick();
      expect(onClick).toHaveBeenCalledOnce();
      expect(renderToStaticMarkup(<Button disabled>Save</Button>)).toMatch(/ disabled=""/);
    });
    it("link: drops href, sets aria-disabled and aria-busy, ignores clicks, keeps the label", () => {
      const onClick = vi.fn();
      const el = Button({ href: "/report", busy: true, onClick, children: "Export" });
      expect(el.props.onClick).toBeUndefined();
      const html = renderToStaticMarkup(
        <Button href="/report" busy icon="download" onClick={onClick}>
          Export
        </Button>,
      );
      expect(html).toMatch(/^<a /);
      expect(html).not.toContain("href=");
      expect(html).toContain('aria-disabled="true"');
      expect(html).toContain('aria-busy="true"');
      expect(html).toContain("x-spinner");
      expect(html).not.toContain("x-icon");
      expect(html).toContain("Export");
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("iconEnd", () => {
    it("renders the trailing icon after the label (button)", () => {
      const html = renderToStaticMarkup(
        <Button icon="plus" iconEnd="chevron">
          Add
        </Button>,
      );
      const label = html.indexOf("Add");
      const end = html.indexOf("x-btn-icon-end");
      expect(label).toBeGreaterThan(-1);
      expect(end).toBeGreaterThan(label);
      expect(html.indexOf("x-icon")).toBeLessThan(label);
    });
    it("renders the trailing icon after the label (link)", () => {
      const html = renderToStaticMarkup(
        <Button href="https://example.org" target="_blank" iconEnd="external">
          Open
        </Button>,
      );
      expect(html).toMatch(/^<a /);
      expect(html.indexOf("x-btn-icon-end")).toBeGreaterThan(html.indexOf("Open"));
    });
    it("stays after the label while busy", () => {
      const html = renderToStaticMarkup(
        <Button busy iconEnd="chevron-right">
          Next
        </Button>,
      );
      expect(html.indexOf("x-btn-icon-end")).toBeGreaterThan(html.indexOf("Next"));
    });
  });

  describe("renderLink", () => {
    it("receives href, the button classes and the content, and its return value is rendered", () => {
      const renderLink = vi.fn((p: ButtonRouterLinkProps) => <a data-router="" {...p} />);
      const onClick = vi.fn();
      const html = renderToStaticMarkup(
        <Button href="/users" variant="primary" size="sm" icon="squads" renderLink={renderLink} onClick={onClick} aria-label="All users">
          Users
        </Button>,
      );
      expect(renderLink).toHaveBeenCalledOnce();
      const p = renderLink.mock.calls[0]?.[0];
      expect(p?.href).toBe("/users");
      expect(p?.className).toBe("btn");
      expect(p?.["data-size"]).toBe("sm");
      expect(p?.["aria-label"]).toBe("All users");
      expect(p?.onClick).toBe(onClick);
      expect(html).toContain('data-router=""');
      expect(html).toContain('href="/users"');
      expect(html).toContain('class="btn"');
      expect(html).toContain("Users");
    });
    it("disabled ignores renderLink and renders the aria-disabled anchor without href", () => {
      const renderLink = vi.fn((p: ButtonRouterLinkProps) => <a data-router="" {...p} />);
      const html = renderToStaticMarkup(
        <Button href="/users" disabled renderLink={renderLink}>
          Users
        </Button>,
      );
      expect(renderLink).not.toHaveBeenCalled();
      expect(html).not.toContain("data-router");
      expect(html).not.toContain("href=");
      expect(html).toContain('aria-disabled="true"');
    });
    it("busy ignores renderLink too", () => {
      const renderLink = vi.fn((p: ButtonRouterLinkProps) => <a data-router="" {...p} />);
      const html = renderToStaticMarkup(
        <Button href="/users" busy renderLink={renderLink}>
          Users
        </Button>,
      );
      expect(renderLink).not.toHaveBeenCalled();
      expect(html).toContain('aria-busy="true"');
      expect(html).not.toContain("href=");
    });
  });
});
