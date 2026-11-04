import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./Textarea";

const meta = {
  title: "Inputs/Textarea",
  component: Textarea,
  args: { label: "Task for the agent", placeholder: "Add a retry with backoff to the login request", rows: 4 },
} satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: "Sent as the first message of the session." } };
export const Mono: Story = {
  args: { label: "Environment", mono: true, defaultValue: "RUST_LOG=info\nXDEV_PORT=4317", hint: "One KEY=value per line." },
};
export const Invalid: Story = { args: { label: "Environment", mono: true, defaultValue: "RUST_LOG info", error: "Use KEY=value lines." } };
export const NoResize: Story = { args: { resize: "none" } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "Waiting for the agent to finish." } };
