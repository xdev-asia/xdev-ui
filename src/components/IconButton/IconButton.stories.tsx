import type { Meta, StoryObj } from "@storybook/react-vite";
import { ICON_NAMES } from "../../icons";
import { IconButton } from "./IconButton";

const meta = {
  title: "Actions/IconButton",
  component: IconButton,
  args: { icon: "plus", label: "New tab" },
  argTypes: { icon: { control: "select", options: ICON_NAMES } },
} satisfies Meta<typeof IconButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Toolbar: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 4 }}>
      <IconButton icon="search" label="Search in files" />
      <IconButton icon="branch" label="Switch branch" />
      <IconButton icon="more" label="More actions" />
      <IconButton icon="close" label="Close panel" />
    </div>
  ),
};
/** `size="lg"` is the 44px touch target. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <IconButton icon="plus" label="Add" size="sm" />
      <IconButton icon="plus" label="Add" />
      <IconButton icon="plus" label="Add" size="lg" />
    </div>
  ),
};
