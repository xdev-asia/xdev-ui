import type { Meta, StoryObj } from "@storybook/react-vite";
import { Meter } from "./Meter";

const meta = {
  title: "Status/Meter",
  component: Meter,
  args: { value: 42, label: "5-hour window", warnAt: 80 },
  argTypes: { value: { control: { type: "range", min: 0, max: 100 } } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Meter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Warning: Story = { args: { value: 91 } };
export const Tones: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8 }}>
      <Meter value={85} label="Session" tone="ok" fill />
      <Meter value={45} label="Weekly" tone="warn" fill />
      <Meter value={12} label="Tokens" tone="danger" fill valueText="720 / 6000 left" />
    </div>
  ),
};
