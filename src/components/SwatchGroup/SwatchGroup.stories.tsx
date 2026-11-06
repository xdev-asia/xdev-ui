import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SwatchGroup } from "./SwatchGroup";

const options = [
  { value: "red", label: "Red", tone: "danger" as const },
  { value: "amber", label: "Amber", tone: "warning" as const },
  { value: "blue", label: "Blue", tone: "accent" as const },
  { value: "white", label: "White", tone: "neutral" as const },
];

const meta = {
  title: "Inputs/SwatchGroup",
  component: SwatchGroup,
  args: { "aria-label": "Colour", value: "red", options, onChange: () => {} },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <SwatchGroup {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof SwatchGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Small: Story = { args: { size: "sm" } };
