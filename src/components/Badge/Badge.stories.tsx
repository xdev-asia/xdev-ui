import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

const STATUSES = ["new", "changed", "unchanged", "foreign", "neutral"] as const;
const TONES = [
  ["neutral", "draft"],
  ["accent", "internal"],
  ["ok", "active"],
  ["warn", "pending"],
  ["danger", "failed"],
] as const;
const meta = {
  title: "Display/Badge",
  component: Badge,
  args: { children: "changed", status: "changed" },
  argTypes: {
    status: { control: "inline-radio", options: STATUSES },
    tone: { control: "inline-radio", options: TONES.map(([t]) => t) },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const All: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {STATUSES.map((s) => (
        <Badge key={s} status={s}>
          {s}
        </Badge>
      ))}
    </div>
  ),
};
export const Danger: Story = { args: { tone: "danger", status: undefined, children: "failed" } };
export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {TONES.map(([tone, word]) => (
        <Badge key={tone} tone={tone} title={`tone ${tone}`}>
          {word}
        </Badge>
      ))}
    </div>
  ),
};
