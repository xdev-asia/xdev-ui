import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { SaveBar } from "./SaveBar";

const meta = {
  title: "Layout/SaveBar",
  component: SaveBar,
  args: { dirty: true, onSave: fn(), onDiscard: fn() },
} satisfies Meta<typeof SaveBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Saving: Story = { args: { busy: true } };
export const Failed: Story = { args: { error: "Could not save. Check your connection and try again." } };
