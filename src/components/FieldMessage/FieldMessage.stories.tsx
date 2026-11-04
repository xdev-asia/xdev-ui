import type { Meta, StoryObj } from "@storybook/react-vite";
import { FieldMessage } from "./FieldMessage";

const meta = {
  title: "Status/FieldMessage",
  component: FieldMessage,
  args: { children: "Branch feat/tabs already exists. Pick another name." },
} satisfies Meta<typeof FieldMessage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ErrorTone: Story = {};
export const Warn: Story = { args: { tone: "warn", children: "Spaces become dashes: feat/new-tabs" } };
export const Info: Story = { args: { tone: "info", children: "The worktree is created next to the repo." } };
