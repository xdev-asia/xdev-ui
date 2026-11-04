import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./Select";

const meta = {
  title: "Inputs/Select",
  component: Select,
  args: {
    "aria-label": "Agent profile",
    defaultValue: "claude",
    options: [
      { value: "claude", label: "Claude Code" },
      { value: "codex", label: "Codex" },
      { value: "custom", label: "Custom command" },
    ],
  },
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
