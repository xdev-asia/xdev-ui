import type { Meta, StoryObj } from "@storybook/react-vite";
import { DonutChart } from "./DonutChart";

const meta = {
  title: "Display/DonutChart",
  component: DonutChart,
  args: {
    label: "Revenue by category",
    center: (
      <>
        <strong>$48k</strong>
        <span>Revenue</span>
      </>
    ),
    slices: [
      { key: "software", label: "Software", value: 42, valueLabel: "42%" },
      { key: "hardware", label: "Hardware", value: 24, valueLabel: "24%" },
      { key: "services", label: "Services", value: 18, valueLabel: "18%" },
      { key: "training", label: "Training", value: 10, valueLabel: "10%" },
      { key: "support", label: "Support", value: 6, valueLabel: "6%" },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DonutChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const OneSlice: Story = { args: { slices: [{ key: "all", label: "Everything", value: 1, valueLabel: "100%" }], center: undefined } };
