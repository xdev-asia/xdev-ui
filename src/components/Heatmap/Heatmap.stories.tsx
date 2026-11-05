import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heatmap, type HeatmapCell } from "./Heatmap";

const days: HeatmapCell[] = Array.from({ length: 91 }, (_, i) => ({
  key: `day-${i}`,
  level: ((i * 7 + (i % 5)) % 5) as HeatmapCell["level"],
  label: `Day ${i + 1}`,
}));

const meta = {
  title: "Display/Heatmap",
  component: Heatmap,
  args: { cells: days, label: "Tokens per day", startWeekday: 2, lessLabel: "Less", moreLabel: "More" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Heatmap>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NoLegend: Story = { args: { lessLabel: undefined, moreLabel: undefined } };
