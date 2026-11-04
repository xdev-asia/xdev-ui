import type { Meta, StoryObj } from "@storybook/react-vite";
import { AgentChip } from "../AgentChip/AgentChip";
import { DiffStat } from "../DiffStat/DiffStat";
import { StatusDot } from "../StatusDot/StatusDot";
import { StatusBar } from "./StatusBar";

const meta = {
  title: "Navigation/StatusBar",
  component: StatusBar,
  parameters: { layout: "fullscreen" },
  args: {
    items: [
      <span key="b">feat/login-retry</span>,
      <DiffStat key="d" added={128} removed={14} />,
      "spacer",
      <span key="s" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
        <StatusDot state="working" /> 2 working
      </span>,
      <AgentChip key="a" profile="claude" title="Claude Code" />,
      <span key="t">UTF-8</span>,
    ],
  },
} satisfies Meta<typeof StatusBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
