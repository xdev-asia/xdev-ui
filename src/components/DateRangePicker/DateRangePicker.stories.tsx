import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DateRangePicker, type DateRange } from "./DateRangePicker";

const presets = [
  { label: "Last 7 days", range: { start: "2026-10-31", end: "2026-11-06" } },
  { label: "Last 30 days", range: { start: "2026-10-08", end: "2026-11-06" } },
  { label: "This month", range: { start: "2026-11-01", end: "2026-11-30" } },
];

const meta = {
  title: "Inputs/DateRangePicker",
  component: DateRangePicker,
  args: { label: "Period", value: { start: "2026-11-02", end: "2026-11-12" }, onChange: () => {}, today: "2026-11-06" },
  decorators: [(Story) => <div style={{ width: 380, minHeight: 440, display: "flex", justifyContent: "flex-end" }}><Story /></div>],
} satisfies Meta<typeof DateRangePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<DateRange>(args.value);
    return <DateRangePicker {...args} value={value} onChange={setValue} />;
  },
};
export const OpenWithPresets: Story = {
  args: { presets, defaultOpen: true },
  render: (args) => {
    const [value, setValue] = useState<DateRange>(args.value);
    return <DateRangePicker {...args} value={value} onChange={setValue} />;
  },
};
export const Empty: Story = { args: { value: { start: null, end: null }, hint: "Leave empty for all time." } };
export const Disabled: Story = { args: { disabled: true } };
