import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "./Label";

const meta = {
  title: "Inputs/Label",
  component: Label,
  args: { htmlFor: "story-model", children: "Default model" },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--x-space-1)", width: 280 }}>
      <Label {...args} />
      <button id="story-model" type="button" className="btn-secondary">
        Claude Sonnet
      </button>
    </div>
  ),
} satisfies Meta<typeof Label>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Required: Story = { args: { required: true } };
export const Translated: Story = { args: { required: true, children: "Mô hình mặc định", labels: { required: "bắt buộc" } } };
