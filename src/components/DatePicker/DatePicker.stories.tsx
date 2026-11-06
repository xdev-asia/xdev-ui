import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DatePicker } from "./DatePicker";

const meta = {
  title: "Inputs/DatePicker",
  component: DatePicker,
  args: { label: "Due date", value: "2026-11-06", onChange: () => {}, today: "2026-11-06" },
  decorators: [(Story) => <div style={{ width: 260, minHeight: 420 }}><Story /></div>],
} satisfies Meta<typeof DatePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | null>(args.value);
    return <DatePicker {...args} value={value} onChange={setValue} />;
  },
};
export const Open: Story = { args: { defaultOpen: true } };
export const MinMaxAndWeekends: Story = {
  args: {
    min: "2026-11-03",
    max: "2026-11-27",
    defaultOpen: true,
    hint: "Weekdays this month only.",
    isDateDisabled: (iso) => [0, 6].includes(new Date(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10))).getDay()),
  },
};
export const Vietnamese: Story = {
  args: {
    label: "Ngày đến hạn",
    locale: "vi",
    defaultOpen: true,
    labels: { openCalendar: "Mở lịch", calendar: "Chọn ngày", previousMonth: "Tháng trước", nextMonth: "Tháng sau", today: "Hôm nay", clear: "Xoá", invalid: "Ngày không hợp lệ" },
  },
};
export const Invalid: Story = { args: { value: null, error: "Pick a due date." } };
export const Disabled: Story = { args: { disabled: true } };
