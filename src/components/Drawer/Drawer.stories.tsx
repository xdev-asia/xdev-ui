import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Button } from "../Button/Button";
import { Drawer } from "./Drawer";

const meta = {
  title: "Overlays/Drawer",
  component: Drawer,
  args: {
    title: "Edit banner",
    description: "Shown at the top of the home page",
    modal: false,
    onClose: fn(),
    children: "Form fields go here.",
    footer: (
      <>
        <Button variant="secondary">Cancel</Button>
        <Button>Save</Button>
      </>
    ),
  },
} satisfies Meta<typeof Drawer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Wide: Story = { args: { size: "wide" } };
