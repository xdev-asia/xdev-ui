import type { Meta, StoryObj } from "@storybook/react-vite";
import { MenuButton } from "./MenuButton";

const meta = {
  title: "Overlays/MenuButton",
  component: MenuButton,
  args: {
    label: "Actions",
    items: [
      { label: "Edit" },
      { label: "Duplicate", chord: "Ctrl+D" },
      { label: "Open profile", href: "#profile" },
      { type: "separator" },
      { label: "Delete", danger: true },
    ],
  },
} satisfies Meta<typeof MenuButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const IconOnly: Story = { args: { variant: "icon", label: "Actions for Ada", align: "end" } };
export const Inline: Story = { args: { portal: false } };
