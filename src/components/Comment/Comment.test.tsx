import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Comment } from "./Comment";

describe("Comment", () => {
  it("shows the author, the time and the body", () => {
    const html = renderToStaticMarkup(
      <Comment author="maya" time="2h ago">
        Why?
      </Comment>,
    );
    expect(html).toContain("maya");
    expect(html).toContain("2h ago");
    expect(html).toContain('<div class="x-comment-body">Why?</div>');
    expect(html).not.toContain("data-state");
  });

  it("badges a bot and a state with the given words", () => {
    const html = renderToStaticMarkup(
      <Comment author="coderabbitai" bot botLabel="Bot" state="resolved" stateLabel="Resolved">
        x
      </Comment>,
    );
    expect(html).toContain("Bot");
    expect(html).toContain("Resolved");
    expect(html).toContain('data-state="resolved"');
    expect(html).toContain("data-bot");
  });

  it("omits a badge without its label", () => {
    const html = renderToStaticMarkup(
      <Comment author="a" bot state="outdated">
        x
      </Comment>,
    );
    expect(html).not.toContain("ws-tag");
    expect(html).toContain('data-state="outdated"');
  });

  it("places location, actions and footer in their own regions", () => {
    const html = renderToStaticMarkup(
      <Comment author="a" location={<span>a.rs:L3</span>} actions={<button type="button">Copy</button>} footer={<span>reacts</span>}>
        x
      </Comment>,
    );
    expect(html).toContain('<div class="x-comment-location"><span>a.rs:L3</span></div>');
    expect(html).toContain('<span class="x-comment-actions"><button type="button">Copy</button></span>');
    expect(html).toContain('<footer class="x-comment-foot"><span>reacts</span></footer>');
  });

  it("uses no inline colour", () => {
    const html = renderToStaticMarkup(
      <Comment author="a" bot botLabel="Bot" state="resolved" stateLabel="Resolved">
        x
      </Comment>,
    );
    expect(html).not.toMatch(/style=|#[0-9a-f]{3,8}\b|rgb\(/i);
  });
});
