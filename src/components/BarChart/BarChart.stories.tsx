import type { Meta, StoryObj } from "@storybook/react-vite";
import { BarChart } from "./BarChart";

const meta = {
  title: "Display/BarChart",
  component: BarChart,
  args: {
    label: "Tokens by provider",
    bars: [
      { key: "anthropic", label: "Anthropic", value: 1_200_000, valueLabel: "1.2M" },
      { key: "openai", label: "OpenAI", value: 640_000, valueLabel: "640k" },
      { key: "groq", label: "Groq", value: 90_000, valueLabel: "90k" },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BarChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {};
export const Vertical: Story = { args: { orientation: "vertical" } };
