import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  // Pages are tested as views; this renders the root so a hook outside its provider fails here, not in the browser.
  it("renders the whole app on the server without throwing", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("Sign in");
  });
});
