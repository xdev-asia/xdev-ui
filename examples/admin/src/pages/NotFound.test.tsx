import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider, type Locale } from "../i18n";
import { NotFoundPage } from "./NotFound";

const render = (locale: Locale) =>
  renderToStaticMarkup(
    <I18nProvider locale={locale}>
      <NotFoundPage />
    </I18nProvider>,
  );

describe("NotFound", () => {
  it("renders a centered empty state with one action in en and vi", () => {
    const en = render("en");
    expect(en).toContain("Page not found");
    expect(en).toContain("Go to dashboard");
    expect(en.match(/class="btn"/g)).toHaveLength(1);
    expect(render("vi")).toContain("Không tìm thấy trang");
    expect(render("vi")).toContain("Về trang tổng quan");
  });
});
