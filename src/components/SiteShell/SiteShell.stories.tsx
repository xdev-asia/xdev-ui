import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrandMark } from "../BrandMark/BrandMark";
import { SiteShell } from "./SiteShell";

const meta = {
  title: "Layout/SiteShell",
  component: SiteShell,
  args: {
    brand: (
      <a href="/">
        <BrandMark variant="mark" size={24} />
        <span>xDev account</span>
      </a>
    ),
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
    linksLabel: "Legal",
    children: "Page content",
  },
} satisfies Meta<typeof SiteShell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
