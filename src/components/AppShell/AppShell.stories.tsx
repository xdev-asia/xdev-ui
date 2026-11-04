import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Breadcrumb } from "../Breadcrumb/Breadcrumb";
import { BrandMark } from "../BrandMark/BrandMark";
import { NavList } from "../NavList/NavList";
import { AppShell } from "./AppShell";

const meta = {
  title: "Layout/AppShell",
  component: AppShell,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AppShell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    brand: <BrandMark size={24} />,
    nav: <NavList items={[{ id: "home", label: "Overview", icon: "home" }, { id: "users", label: "Users", icon: "accounts" }]} value="home" />,
    crumbs: <Breadcrumb items={[{ label: "Overview" }]} />,
    children: <div style={{ padding: 24 }}>Page content</div>,
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ height: "100vh" }}>
        <AppShell {...args} navOpen={open} onNavOpenChange={setOpen} />
      </div>
    );
  },
};
