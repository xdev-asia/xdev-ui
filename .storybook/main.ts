import type { StorybookConfig } from "@storybook/react-vite";

// Showcase of every component. Built into dist-demo/storybook by `pnpm build:demo`
// and served at ui.xdev.asia/storybook/.
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-themes"],
  staticDirs: [{ from: "../assets/brand", to: "/brand" }],
  framework: {
    name: "@storybook/react-vite",
    // The root vite.config.ts is the library build; stories need a plain app config.
    options: { builder: { viteConfigPath: ".storybook/vite.config.ts" } },
  },
  core: { disableTelemetry: true },
  typescript: { reactDocgen: "react-docgen" },
};

export default config;
