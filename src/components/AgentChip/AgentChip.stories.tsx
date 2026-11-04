import type { Meta, StoryObj } from "@storybook/react-vite";
import { AgentChip } from "./AgentChip";

const meta = {
  title: "Display/AgentChip",
  component: AgentChip,
  args: { profile: "claude", title: "Claude Code" },
  argTypes: { profile: { control: "inline-radio", options: ["claude", "codex", "custom"] } },
} satisfies Meta<typeof AgentChip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Claude: Story = {};
export const Codex: Story = { args: { profile: "codex", title: "Codex" } };
export const Custom: Story = { args: { profile: "custom", letter: "G", title: "Custom profile" } };
