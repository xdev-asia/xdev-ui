import type { Meta, StoryObj } from "@storybook/react-vite";
import { Menu } from "./Menu";

const meta = {
  title: "Overlays/Menu",
  component: Menu,
  args: {
    label: "Tab actions",
    initialFocus: false,
    items: [
      { label: "Rename tab", chord: "F2" },
      { label: "Split right", chord: "Ctrl+Alt+Right", active: true },
      { label: "Tab color", submenu: true, swatch: 4 },
      { type: "separator" },
      { label: "Sound alerts", checked: true },
      { label: "Resume session", disabled: true },
      { type: "separator" },
      { label: "Close tab", chord: "Ctrl+W", danger: true },
    ],
  },
} satisfies Meta<typeof Menu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Links: Story = {
  args: {
    label: "Account",
    items: [
      { label: "Profile", href: "#profile" },
      { label: "Settings", href: "#settings" },
      { type: "separator" },
      { label: "Sign out", danger: true },
    ],
  },
};
