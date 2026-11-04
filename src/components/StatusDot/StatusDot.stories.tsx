import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusDot } from "./StatusDot";

const STATES = ["working", "waiting", "done", "failed", "idle", "exited"] as const;
const meta = {
  title: "Status/StatusDot",
  component: StatusDot,
  args: { state: "working", label: "Working" },
  argTypes: { state: { control: "select", options: STATES } },
} satisfies Meta<typeof StatusDot>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Pulse: Story = { args: { pulse: true } };
export const Sessions: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 10 }}>
      {STATES.map((s) => (
        <span key={s} style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <StatusDot state={s} /> {s}
        </span>
      ))}
    </div>
  ),
};
export const PullRequest: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {(["open", "draft", "merged", "closed"] as const).map((p) => (
        <span key={p} style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <StatusDot pr={p} /> {p}
        </span>
      ))}
    </div>
  ),
};
export const Checks: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {(["pass", "pending", "fail", "cancel", "skipping"] as const).map((c) => (
        <span key={c} style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <StatusDot check={c} /> {c}
        </span>
      ))}
    </div>
  ),
};
