import type { Meta, StoryObj } from "@storybook/react-vite";
import { Segmented } from "./Segmented";

const meta = {
  title: "Inputs/Segmented",
  component: Segmented,
  args: {
    label: "Diff base",
    defaultValue: "main",
    options: [
      { value: "main", label: "main" },
      { value: "upstream", label: "Upstream" },
      { value: "last", label: "Last commit" },
    ],
  },
} satisfies Meta<typeof Segmented>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Theme: Story = {
  args: {
    label: "Theme",
    defaultValue: "dark",
    options: [
      { value: "dark", label: "Dark" },
      { value: "light", label: "Light" },
      { value: "system", label: "System" },
    ],
  },
};
