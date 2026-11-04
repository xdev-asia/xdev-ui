import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FontField } from "./FontField";

const meta = {
  title: "Inputs/FontField",
  component: FontField,
  args: { "aria-label": "UI font", value: "", onChange: () => {} },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <FontField {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof FontField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Chosen: Story = { args: { value: "Inter" } };
export const Disabled: Story = { args: { disabled: true, value: "Inter" } };
