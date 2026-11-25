import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

addons.setConfig({
  theme: create({
    base: "dark",
    brandTitle: "xdev-ui",
    brandUrl: "/",
    brandImage: "./brand/xdev-lockup-dark.svg",
    brandTarget: "_self",
    colorPrimary: "#3a6be7",
    colorSecondary: "#3a6be7",
    appBg: "#0b0b0d",
    appContentBg: "#101013",
    appPreviewBg: "#0b0b0d",
    appBorderColor: "#232329",
    barBg: "#101013",
    textColor: "#e8e8ec",
    textMutedColor: "#8e8e98",
    fontBase: '"Roboto", "Segoe UI", system-ui, sans-serif',
    fontCode: '"JetBrains Mono", ui-monospace, Consolas, monospace',
  }),
});
