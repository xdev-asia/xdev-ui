import type { Meta, StoryObj } from "@storybook/react-vite";
import { PairingCode } from "./PairingCode";

const meta = {
  title: "Display/PairingCode",
  component: PairingCode,
  args: { value: "7K4QM-2XD9P", label: "Pairing code" },
  decorators: [(Story) => <div style={{ width: 360, maxWidth: "100%" }}><Story /></div>],
} satisfies Meta<typeof PairingCode>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithCopy: Story = { args: { copyLabel: "Copy code", onCopy: () => {} } };
export const CheckCode: Story = { args: { value: "482 913", groupSize: 3, size: "md", label: "Check code" } };
