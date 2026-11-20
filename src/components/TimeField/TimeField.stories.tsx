import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TimeField } from "./TimeField";

const meta = {
  title: "Inputs/TimeField",
  component: TimeField,
  args: { label: "Starts at", value: "09:30", onChange: () => {} },
  decorators: [(Story) => <div style={{ width: 200 }}><Story /></div>],
} satisfies Meta<typeof TimeField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | null>(args.value);
    return <TimeField {...args} value={value} onChange={setValue} />;
  },
};
export const WithSeconds: Story = { args: { label: "Cue point", value: "01:02:03", seconds: true } };
export const Duration: Story = { args: { label: "Length", value: "03:45", mode: "duration", maxMinutes: 120, hint: "Up to two hours." } };
export const Vietnamese: Story = { args: { label: "Giờ bắt đầu", value: null, labels: { invalid: "Giờ không hợp lệ" } } };
export const Invalid: Story = { args: { value: null, error: "Pick a start time." } };
export const Disabled: Story = { args: { disabled: true } };
