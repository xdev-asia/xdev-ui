import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";
import "../src/styles/fonts.css";
import "../src/styles/index.css";

const preview: Preview = {
  decorators: [
    withThemeByDataAttribute({
      themes: { dark: "dark", light: "light" },
      defaultTheme: "dark",
      attributeName: "data-theme",
      parentSelector: "html",
    }),
  ],
  parameters: {
    layout: "padded",
    controls: { expanded: true, matchers: { color: /(background|color)$/i } },
    a11y: { test: "todo" },
    backgrounds: { disable: true },
    viewport: {
      options: {
        phone: { name: "Phone 375", styles: { width: "375px", height: "812px" }, type: "mobile" },
        phoneLarge: { name: "Phone 430", styles: { width: "430px", height: "932px" }, type: "mobile" },
        tablet: { name: "Tablet 768", styles: { width: "768px", height: "1024px" }, type: "tablet" },
        laptop: { name: "Laptop 1280", styles: { width: "1280px", height: "800px" }, type: "desktop" },
        desktop: { name: "Desktop 1440", styles: { width: "1440px", height: "900px" }, type: "desktop" },
      },
    },
    options: {
      storySort: {
        order: ["Overview", "Actions", "Inputs", "Display", "Status", "Navigation", "Overlays", "Brand", "Patterns"],
      },
    },
  },
  tags: ["autodocs"],
};

export default preview;
