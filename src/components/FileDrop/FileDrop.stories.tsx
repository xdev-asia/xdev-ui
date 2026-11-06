import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { FileDrop } from "./FileDrop";

const meta = {
  title: "Inputs/FileDrop",
  component: FileDrop,
  args: { label: "Attachments", accept: "image/*,.pdf", maxSize: 5 * 1024 * 1024, multiple: true, onFiles: fn(), onRemove: fn() },
} satisfies Meta<typeof FileDrop>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const WithFiles: Story = {
  args: {
    items: [
      { id: "1", name: "contract.pdf", size: 820_000 },
      { id: "2", name: "banner.png", size: 1_400_000, progress: 45 },
      { id: "3", name: "photo.jpg", size: 3_100_000, error: "Upload failed" },
    ],
  },
};
