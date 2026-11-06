import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { CodeInput } from "./CodeInput";

const meta = {
  title: "Inputs/CodeInput",
  component: CodeInput,
  args: { length: 10, value: "", label: "Pairing code", onChange: () => {} },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <CodeInput {...args} value={value} onChange={setValue} />;
  },
  decorators: [(Story) => <div style={{ width: 360, maxWidth: "100%" }}><Story /></div>],
} satisfies Meta<typeof CodeInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Pairing: Story = {};
export const CheckDigits: Story = { args: { length: 6, groupSize: 3, alphabet: "digits" } };
export const Invalid: Story = { args: { value: "7K4QM2XD9P", invalid: true } };
