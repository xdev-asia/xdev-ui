import type { Meta, StoryObj } from "@storybook/react-vite";
import { TimeSeriesChart, type TimeSeriesPoint } from "./TimeSeriesChart";

const days: TimeSeriesPoint[] = Array.from({ length: 30 }, (_, i) => {
  const v = i === 11 ? null : Math.round(4000 + 3000 * Math.sin(i / 4) + i * 120);
  return { key: `d${i}`, value: v, label: v === null ? `Day ${i + 1}: no data` : `Day ${i + 1}: ${v} tokens` };
});

const meta = {
  title: "Display/TimeSeriesChart",
  component: TimeSeriesChart,
  args: {
    points: days,
    label: "Tokens per day",
    maxLabel: "7.6k",
    zeroLabel: "0",
    ticks: [0, 7, 14, 21, 29].map((i) => ({ index: i, label: `Day ${i + 1}` })),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TimeSeriesChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const AllZero: Story = { args: { points: days.map((p) => ({ ...p, value: 0 })), maxLabel: undefined } };
