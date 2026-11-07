import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Composer } from "./Composer";

const meta = {
  title: "Layout/Composer",
  component: Composer,
  args: { value: "", onChange: () => {}, onSend: () => {}, placeholder: "Ask the agent" },
} satisfies Meta<typeof Composer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return <Composer {...args} value={value} onChange={setValue} onSend={() => setValue("")} />;
  },
};
export const WithModelAndAttach: Story = {
  args: {
    value: "Fix the failing test",
    model: { value: "opus", options: [{ value: "opus", label: "Opus" }, { value: "sonnet", label: "Sonnet" }] },
    onModel: () => {},
    onAttach: () => {},
  },
};
export const Disabled: Story = { args: { value: "Waiting for approval", disabled: true } };
