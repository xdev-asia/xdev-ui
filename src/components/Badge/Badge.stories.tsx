import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

const STATUSES = ["new", "changed", "unchanged", "foreign", "neutral"] as const;
const meta = {
  title: "Display/Badge",
  component: Badge,
  args: { children: "changed", status: "changed" },
  argTypes: { status: { control: "inline-radio", options: STATUSES } },
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
